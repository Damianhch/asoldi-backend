// WordPress REST API Integration
// Syncs users with 'employee' role from your WordPress site

// Read environment variables at runtime, not at module load time
function getWordPressConfig() {
  return {
    url: (process.env.WORDPRESS_URL || 'https://asoldi.com').trim(),
    username: process.env.WORDPRESS_USERNAME?.trim() || '',
    password: process.env.WORDPRESS_APP_PASSWORD?.trim() || '',
  };
}

interface WordPressUser {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  registered_date: string;
  meta?: Record<string, unknown>;
}

interface WordPressResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generate Basic Auth header
function getAuthHeader(): string {
  const config = getWordPressConfig();
  if (!config.username || !config.password) {
    throw new Error('WordPress credentials not configured');
  }
  
  const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
  return `Basic ${credentials}`;
}

// Helper function for WordPress API requests
async function wpFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<WordPressResponse<T>> {
  const config = getWordPressConfig();
  if (!config.url) {
    return { success: false, error: 'WordPress URL not configured' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth header if credentials are available
    if (config.username && config.password) {
      headers['Authorization'] = getAuthHeader();
    }

    const url = `${config.url}/wp-json/wp/v2${endpoint}`;
    console.log('WordPress API Request:', url);
    
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData: any = {};
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }
      
      return {
        success: false,
        error: errorData.message || errorData.code || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('WordPress API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get all users from WordPress
export async function getWordPressUsers(): Promise<WordPressResponse<WordPressUser[]>> {
  return wpFetch<WordPressUser[]>('/users?per_page=100&context=edit');
}

// Get users by role - specifically 'employee' role
export async function getWordPressEmployees(): Promise<WordPressResponse<WordPressUser[]>> {
  // Try to get users with 'employee' role directly
  const response = await wpFetch<WordPressUser[]>('/users?per_page=100&context=edit&roles=employee');
  
  if (response.success && response.data && response.data.length > 0) {
    console.log(`Found ${response.data.length} employees with 'employee' role`);
    return response;
  }
  
  // If no users found with 'employee' role, try fetching all and filtering
  console.log('No employees found with direct role filter, fetching all users...');
  const allUsersResponse = await getWordPressUsers();
  
  if (!allUsersResponse.success || !allUsersResponse.data) {
    return allUsersResponse;
  }
  
  console.log(`Fetched ${allUsersResponse.data.length} total users, filtering for employees...`);
  
  // Filter to only include users with 'employee' role (case-insensitive)
  const employees = allUsersResponse.data.filter(user => {
    const roles = user.roles || [];
    return roles.some(role => 
      role.toLowerCase() === 'employee' || 
      role.toLowerCase() === 'ansatt' // Norwegian for employee
    );
  });
  
  console.log(`Found ${employees.length} employees after filtering`);
  
  if (employees.length === 0) {
    return {
      success: false,
      error: `No users found with 'employee' role. Found ${allUsersResponse.data.length} total users. Available roles: ${[...new Set(allUsersResponse.data.flatMap(u => u.roles || []))].join(', ')}`,
    };
  }
  
  return { success: true, data: employees };
}

// Get a specific user by ID
export async function getWordPressUser(id: number): Promise<WordPressResponse<WordPressUser>> {
  return wpFetch<WordPressUser>(`/users/${id}?context=edit`);
}

// Test WordPress connection
export async function testWordPressConnection(): Promise<boolean> {
  try {
    const config = getWordPressConfig();
    if (!config.username || !config.password) {
      return false;
    }
    
    const response = await fetch(`${config.url}/wp-json/wp/v2/users/me`, {
      headers: {
        'Authorization': getAuthHeader(),
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Convert WordPress user to Worker format
export function wpUserToWorkerData(wpUser: WordPressUser): {
  name: string;
  email: string;
  wordpressId: number;
  role: 'caller' | 'admin' | 'other';
} {
  return {
    name: wpUser.name || wpUser.username,
    email: wpUser.email,
    wordpressId: wpUser.id,
    role: 'caller', // All employees are callers by default
  };
}

// Sync WordPress employees - returns the employee data
export async function syncWordPressEmployees(): Promise<{
  synced: number;
  employees: Array<{ name: string; email: string; wordpressId: number }>;
  error?: string;
}> {
  const response = await getWordPressEmployees();

  if (!response.success) {
    return {
      synced: 0,
      employees: [],
      error: response.error || 'Failed to fetch WordPress employees',
    };
  }

  if (!response.data || response.data.length === 0) {
    return {
      synced: 0,
      employees: [],
      error: 'No employees found with "employee" role in WordPress',
    };
  }

  const employees = response.data.map(user => wpUserToWorkerData(user));

  return {
    synced: employees.length,
    employees,
  };
}
