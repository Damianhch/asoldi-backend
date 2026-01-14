import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint helps debug environment variable issues
  // DO NOT expose this in production - remove or secure it
  
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;
  const url = process.env.WORDPRESS_URL;
  
  // Get all WordPress-related env vars
  const allWordEnvVars: Record<string, string> = {};
  Object.keys(process.env).forEach(key => {
    if (key.includes('WORD')) {
      allWordEnvVars[key] = process.env[key] || '';
    }
  });
  
  // Check for quotes
  const hasQuotes = {
    username: username ? (username.startsWith('"') || username.startsWith("'")) : false,
    password: password ? (password.startsWith('"') || password.startsWith("'")) : false,
    url: url ? (url.startsWith('"') || url.startsWith("'")) : false,
  };
  
  return NextResponse.json({
    configured: {
      hasUrl: !!url,
      hasUsername: !!username,
      hasPassword: !!password,
    },
    lengths: {
      url: url?.length || 0,
      username: username?.length || 0,
      password: password?.length || 0,
    },
    hasQuotes,
    // Show first/last chars for debugging (not full values for security)
    preview: {
      url: url || 'NOT SET',
      username: username ? `${username.substring(0, 5)}...${username.substring(Math.max(0, username.length - 5))}` : 'NOT SET',
      password: password ? `${password.substring(0, 5)}...${password.substring(Math.max(0, password.length - 5))}` : 'NOT SET',
    },
    rawValues: {
      url: url ? `"${url}"` : 'NOT SET',
      username: username ? `"${username}"` : 'NOT SET',
      password: password ? `"${password}"` : 'NOT SET',
    },
    allWordEnvVars,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('WORD')).join(', '),
  });
}

