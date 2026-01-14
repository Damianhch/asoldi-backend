// WordPress REST API Integration
// Syncs users with 'employee' role from your WordPress site

const WORDPRESS_URL = process.env.WORDPRESS_URL || 'https://asoldi.com';
const WORDPRESS_USERNAME = process.env.WORDPRESS_USERNAME;
const WORDPRESS_APP_PASSWORD = process.env.WORDPRESS_APP_PASSWORD;

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
  if (!WORDPRESS_USERNAME || !WORDPRESS_APP_PASSWORD) {
    throw new Error('WordPress credentials not configured');
  }
  
  const credentials = Buffer.from(`${WORDPRESS_USERNAME}:${WORDPRESS_APP_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
}

// Helper function for WordPress API requests
async function wpFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<WordPressResponse<T>> {
  if (!WORDPRESS_URL) {
    return { success: false, error: 'WordPress URL not configured' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth header if credentials are available
    if (WORDPRESS_USERNAME && WORDPRESS_APP_PASSWORD) {
      headers['Authorization'] = getAuthHeader();
    }

    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
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
  // Try to get users with 'employee' role
  const response = await wpFetch<WordPressUser[]>('/users?per_page=100&context=edit&roles=employee');
  
  if (response.success && response.data && response.data.length > 0) {
    return response;
  }
  
  // If no users found with 'employee' role, try fetching all and filtering
  const allUsersResponse = await getWordPressUsers();
  
  if (!allUsersResponse.success || !allUsersResponse.data) {
    return allUsersResponse;
  }
  
  // Filter to only include users with 'employee' role
  const employees = allUsersResponse.data.filter(user => 
    user.roles.includes('employee') || 
    user.roles.includes('Employee') ||
    user.roles.includes('ansatt') // Norwegian for employee
  );
  
  return { success: true, data: employees };
}

// Get a specific user by ID
export async function getWordPressUser(id: number): Promise<WordPressResponse<WordPressUser>> {
  return wpFetch<WordPressUser>(`/users/${id}?context=edit`);
}

// Test WordPress connection
export async function testWordPressConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
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

  if (!response.success || !response.data) {
    return {
      synced: 0,
      employees: [],
      error: response.error || 'Failed to fetch WordPress employees',
    };
  }

  const employees = response.data.map(user => wpUserToWorkerData(user));

  return {
    synced: employees.length,
    employees,
  };
}
