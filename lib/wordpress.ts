// WordPress REST API Integration
// Syncs users from your WordPress site

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
  meta?: Record<string, any>;
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
      ...options.headers as Record<string, string>,
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

// Get a specific user by ID
export async function getWordPressUser(id: number): Promise<WordPressResponse<WordPressUser>> {
  return wpFetch<WordPressUser>(`/users/${id}?context=edit`);
}

// Get users by role
export async function getWordPressUsersByRole(role: string): Promise<WordPressResponse<WordPressUser[]>> {
  return wpFetch<WordPressUser[]>(`/users?roles=${role}&per_page=100&context=edit`);
}

// Search users
export async function searchWordPressUsers(search: string): Promise<WordPressResponse<WordPressUser[]>> {
  return wpFetch<WordPressUser[]>(`/users?search=${encodeURIComponent(search)}&per_page=100`);
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
export function wpUserToWorker(wpUser: WordPressUser): {
  name: string;
  email: string;
  role: 'caller' | 'admin' | 'other';
  status: 'onboarding';
  startDate: string;
} {
  // Map WordPress roles to your worker roles
  let role: 'caller' | 'admin' | 'other' = 'other';
  
  if (wpUser.roles.includes('administrator')) {
    role = 'admin';
  } else if (wpUser.roles.includes('subscriber') || wpUser.roles.includes('caller')) {
    role = 'caller';
  }

  return {
    name: wpUser.name || wpUser.username,
    email: wpUser.email,
    role,
    status: 'onboarding',
    startDate: wpUser.registered_date?.split('T')[0] || new Date().toISOString().split('T')[0],
  };
}

// Sync all WordPress users to workers
export async function syncWordPressUsers(): Promise<{
  synced: number;
  errors: string[];
  users: Array<{ name: string; email: string }>;
}> {
  const result = {
    synced: 0,
    errors: [] as string[],
    users: [] as Array<{ name: string; email: string }>,
  };

  const response = await getWordPressUsers();

  if (!response.success || !response.data) {
    result.errors.push(response.error || 'Failed to fetch WordPress users');
    return result;
  }

  for (const wpUser of response.data) {
    try {
      const workerData = wpUserToWorker(wpUser);
      result.users.push({ name: workerData.name, email: workerData.email });
      result.synced++;
    } catch (error) {
      result.errors.push(`Failed to process user ${wpUser.username}: ${error}`);
    }
  }

  return result;
}


