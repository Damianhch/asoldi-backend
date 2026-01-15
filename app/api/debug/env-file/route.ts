import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const results: any = {
    currentWorkingDir: process.cwd(),
    __dirname: __dirname,
    envFileCheck: {},
    processEnvVars: {},
  };

  // Check multiple possible .env file locations
  const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), 'builds', 'config', '.env'),
    path.join(process.cwd(), '..', 'builds', 'config', '.env'),
    path.join(process.cwd(), '..', '..', 'builds', 'config', '.env'),
    path.join(__dirname, 'builds', 'config', '.env'),
    path.join(__dirname, '..', 'builds', 'config', '.env'),
    path.join(__dirname, '..', '..', 'builds', 'config', '.env'),
    path.join(__dirname, '..', '..', '..', 'builds', 'config', '.env'),
    '/home/u439392007/domains/admin.asoldi.com/public_html/builds/config/.env',
    path.join(process.cwd(), 'public_html', 'builds', 'config', '.env'),
  ];

  // Check each path
  for (const envPath of envPaths) {
    try {
      const exists = fs.existsSync(envPath);
      results.envFileCheck[envPath] = {
        exists,
        readable: false,
        content: null,
        error: null,
      };

      if (exists) {
        try {
          const content = fs.readFileSync(envPath, 'utf8');
          results.envFileCheck[envPath].readable = true;
          results.envFileCheck[envPath].content = content;
          results.envFileCheck[envPath].size = content.length;
        } catch (error: any) {
          results.envFileCheck[envPath].error = error.message;
        }
      }
    } catch (error: any) {
      results.envFileCheck[envPath] = {
        exists: false,
        error: error.message,
      };
    }
  }

  // Check what's in process.env
  results.processEnvVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    WORDPRESS_URL: process.env.WORDPRESS_URL ? 'SET' : 'NOT SET',
    WORDPRESS_USERNAME: process.env.WORDPRESS_USERNAME ? 'SET' : 'NOT SET',
    WORDPRESS_APP_PASSWORD: process.env.WORDPRESS_APP_PASSWORD ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    ADMIN_USERNAME: process.env.ADMIN_USERNAME ? 'SET' : 'NOT SET',
    allKeys: Object.keys(process.env).sort(),
  };

  // Try to list directory contents
  try {
    const cwdContents = fs.readdirSync(process.cwd());
    results.currentDirContents = cwdContents.slice(0, 20); // First 20 items
  } catch (error: any) {
    results.currentDirContentsError = error.message;
  }

  try {
    const parentDir = path.join(process.cwd(), '..');
    const parentContents = fs.readdirSync(parentDir);
    results.parentDirContents = parentContents.slice(0, 20);
  } catch (error: any) {
    results.parentDirContentsError = error.message;
  }

  return NextResponse.json(results, { status: 200 });
}

