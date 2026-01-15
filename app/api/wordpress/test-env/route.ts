import { NextResponse } from 'next/server';

export async function GET() {
  // This endpoint helps debug environment variable issues
  // DO NOT expose this in production - remove or secure it
  
  const username = process.env.WORDPRESS_USERNAME;
  const password = process.env.WORDPRESS_APP_PASSWORD;
  const url = process.env.WORDPRESS_URL;
  
  // Get ALL environment variables to see what's available
  const allEnvKeys = Object.keys(process.env).sort();
  const wordEnvKeys = allEnvKeys.filter(k => k.includes('WORD'));
  
  // Get all WordPress-related env vars
  const allWordEnvVars: Record<string, string> = {};
  wordEnvKeys.forEach(key => {
    allWordEnvVars[key] = process.env[key] || '';
  });
  
  // Check for quotes
  const hasQuotes = {
    username: username ? (username.startsWith('"') || username.startsWith("'")) : false,
    password: password ? (password.startsWith('"') || password.startsWith("'")) : false,
    url: url ? (url.startsWith('"') || url.startsWith("'")) : false,
  };
  
  // Check other important env vars to see if ANY are working
  const otherEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'SET' : 'NOT SET',
  };

  // Try to load .env file directly in API route as fallback
  let envFileLoaded = false;
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
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
              envFileLoaded = true;
            }
          }
        }
      });
    }
  } catch (error: any) {
    // Ignore errors
  }
  
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
    wordEnvKeys: wordEnvKeys.join(', '),
    otherEnvVars,
    totalEnvVars: allEnvKeys.length,
    sampleEnvKeys: allEnvKeys.slice(0, 20).join(', '), // First 20 env vars
  });
}

