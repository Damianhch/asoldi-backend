import { NextResponse } from 'next/server';
import { testWordPressConnection, getWordPressEmployees, getWordPressConfig } from '@/lib/wordpress';

export async function GET() {
  try {
    const config = getWordPressConfig();
    
    // Test connection
    const connected = await testWordPressConnection();
    
    if (!connected) {
      // Try to get more info by testing the REST API endpoint directly
      const testUrl = `${config.url}/wp-json/wp/v2/users/me`;
      let detailedError = 'Unknown error';
      
      try {
        const response = await fetch(testUrl, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
          },
        });
        const errorText = await response.text();
        detailedError = `HTTP ${response.status}: ${errorText.substring(0, 200)}`;
      } catch (fetchError) {
        detailedError = fetchError instanceof Error ? fetchError.message : 'Network error';
      }
      
      return NextResponse.json({
        connected: false,
        error: 'Could not connect to WordPress.',
        details: {
          url: config.url,
          testUrl: `${config.url}/wp-json/wp/v2/users/me`,
          username: config.username,
          hasPassword: !!config.password,
          passwordLength: config.password?.length || 0,
          error: detailedError,
        },
      });
    }

    // Try to get employees
    const employeesResult = await getWordPressEmployees();
    
    return NextResponse.json({
      connected: true,
      employeesFound: employeesResult.success,
      employeeCount: employeesResult.data?.length || 0,
      error: employeesResult.error,
      employees: employeesResult.data?.map(e => ({
        id: e.id,
        name: e.name,
        email: e.email,
        roles: e.roles,
      })) || [],
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}

