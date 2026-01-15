// WordPress REST API Integration
// Syncs users with 'employee' role from your WordPress site

// Load .env file if variables not in process.env (fallback for Hostinger)
function loadEnvFileIfNeeded() {
  // Only load if WordPress vars are missing
  if (!process.env.WORDPRESS_USERNAME || !process.env.WORDPRESS_APP_PASSWORD) {
    try {
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(process.cwd(), '.builds', 'config', '.env');
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach((line: string) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
              let key = match[1].trim();
              let value = match[2].trim();
              // Remove quotes more aggressively - handle escaped quotes too
              value = value.replace(/^["']|["']$/g, ''); // Remove surrounding quotes
              value = value.replace(/^\\"|\\"$/g, ''); // Remove escaped quotes
              value = value.trim();
              if (!process.env[key]) {
                process.env[key] = value;
              }
            }
          }
        });
      }
    } catch (error) {
      // Ignore errors
    }
  }
}

// Read environment variables at runtime, not at module load time
// Handles quoted values and trims whitespace
function getWordPressConfig() {
  // Try to load .env file if needed
  loadEnvFileIfNeeded();
  
  const getEnv = (key: string, defaultValue = ''): string => {
    const value = process.env[key];
    if (!value) return defaultValue;
    
    // Remove surrounding quotes if present (single or double, including escaped)
    let cleaned = value.trim();
    // Remove quotes more aggressively
    cleaned = cleaned.replace(/^["']|["']$/g, '');
    cleaned = cleaned.replace(/^\\"|\\"$/g, '');
    cleaned = cleaned.replace(/^\\'|\\'$/g, '');
    
    return cleaned.trim();
  };
  
  return {
    url: getEnv('WORDPRESS_URL', 'https://asoldi.com'),
    username: getEnv('WORDPRESS_USERNAME'),
    password: getEnv('WORDPRESS_APP_PASSWORD'),
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
  
  // Debug logging
  console.log('WordPress Auth Config:', {
    url: config.url,
    usernameLength: config.username.length,
    passwordLength: config.password.length,
    usernameFirstChars: config.username.substring(0, 10),
    passwordFirstChars: config.password.substring(0, 10),
  });
  
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
    console.log('Using config:', {
      url: config.url,
      hasUsername: !!config.username,
      hasPassword: !!config.password,
      usernameLength: config.username?.length || 0,
      passwordLength: config.password?.length || 0,
    });
    
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
      console.error('WordPress connection test failed: Missing credentials');
      return false;
    }
    
    const testUrl = `${config.url}/wp-json/wp/v2/users/me`;
    console.log('Testing WordPress connection to:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': getAuthHeader(),
      },
    });
    
    console.log('WordPress connection test response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error response');
      console.error('WordPress connection test failed:', {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText.substring(0, 200),
      });
    }
    
    return response.ok;
  } catch (error) {
    console.error('WordPress connection test exception:', error);
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
