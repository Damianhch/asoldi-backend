import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint helps debug environment variable issues
  // DO NOT expose this in production - remove or secure it
  
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;
  const url = process.env.WORDPRESS_URL;
  
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
    // Show first/last chars for debugging (not full values for security)
    preview: {
      url: url || 'NOT SET',
      username: username ? `${username.substring(0, 3)}...${username.substring(username.length - 3)}` : 'NOT SET',
      password: password ? `${password.substring(0, 3)}...${password.substring(password.length - 3)}` : 'NOT SET',
    },
  });
}

