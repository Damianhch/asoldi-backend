import { NextResponse } from 'next/server';
import { syncWordPressEmployees, testWordPressConnection } from '@/lib/wordpress';
import { addOrUpdateWorkerByEmail, getWorkers, deleteWorker } from '@/lib/data';

export async function POST() {
  try {
    // Load .env file if WordPress vars are missing (fallback for Hostinger and local dev)
    if (!process.env.WORDPRESS_USERNAME || !process.env.WORDPRESS_APP_PASSWORD) {
      try {
        const fs = require('fs');
        const path = require('path');
        
        // Try multiple locations: root .env (local dev) and .builds/config/.env (Hostinger)
        const envPaths = [
          path.join(process.cwd(), '.env'), // Local development
          path.join(process.cwd(), '.env.local'), // Next.js local override
          path.join(process.cwd(), '.builds', 'config', '.env'), // Hostinger
        ];
        
        for (const envPath of envPaths) {
          if (fs.existsSync(envPath)) {
            console.log(`Loading .env from: ${envPath}`);
            const envContent = fs.readFileSync(envPath, 'utf8');
            envContent.split(/\r?\n/).forEach((line: string) => {
              const trimmed = line.trim();
              if (trimmed && !trimmed.startsWith('#')) {
                const match = trimmed.match(/^([^=]+)=(.*)$/);
                if (match) {
                  let key = match[1].trim();
                  let value = match[2].trim();
                  // Remove quotes more aggressively
                  value = value.replace(/^["']|["']$/g, '');
                  value = value.replace(/^\\"|\\"$/g, '');
                  value = value.trim();
                  if (!process.env[key]) {
                    process.env[key] = value;
                  }
                }
              }
            });
            // Stop after first file found
            break;
          }
        }
      } catch (error) {
        // Ignore errors
      }
    }
    
    // Check if WordPress credentials are configured
    // Handle quoted values and trim whitespace
    const getEnvValue = (key: string): string => {
      const value = process.env[key];
      if (!value) return '';
      
      let cleaned = value.trim();
      // Remove surrounding quotes if present (including escaped)
      cleaned = cleaned.replace(/^["']|["']$/g, '');
      cleaned = cleaned.replace(/^\\"|\\"$/g, '');
      cleaned = cleaned.replace(/^\\'|\\'$/g, '');
      
      return cleaned.trim();
    };
    
    const username = getEnvValue('WORDPRESS_USERNAME');
    const password = getEnvValue('WORDPRESS_APP_PASSWORD');
    const url = getEnvValue('WORDPRESS_URL');
    
    // Debug: log what we're getting
    const rawUsername = process.env.WORDPRESS_USERNAME || '';
    const rawPassword = process.env.WORDPRESS_APP_PASSWORD || '';
    
    console.log('WordPress Config Check:', {
      hasUrl: !!url,
      hasUsername: !!username,
      hasPassword: !!password,
      urlLength: url?.length || 0,
      usernameLength: username?.length || 0,
      passwordLength: password?.length || 0,
      rawUsernameLength: rawUsername?.length || 0,
      rawPasswordLength: rawPassword?.length || 0,
      rawUsernameHasQuotes: rawUsername.startsWith('"') || rawUsername.startsWith("'"),
      rawPasswordHasQuotes: rawPassword.startsWith('"') || rawPassword.startsWith("'"),
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('WORD')).join(', '),
    });
    
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: `WordPress credentials not configured. Missing: ${!username ? 'WORDPRESS_USERNAME' : ''} ${!password ? 'WORDPRESS_APP_PASSWORD' : ''}. Raw values: username length=${rawUsername.length}, password length=${rawPassword.length}. Please verify these are set in Hostinger (Node.js app → Environment Variables) and click "Save and redeploy" to restart the server.`,
      }, { status: 400 });
    }

    // Test connection first
    const connected = await testWordPressConnection();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Could not connect to WordPress. Please check:\n1. Your WordPress URL is correct\n2. Your username and App Password are correct\n3. Your WordPress site allows REST API access',
      }, { status: 400 });
    }

    // Sync employees only (users with 'employee' role)
    const syncResult = await syncWordPressEmployees();
    
    if (syncResult.error && syncResult.synced === 0) {
      return NextResponse.json({
        success: false,
        error: syncResult.error || 'No employees found. Make sure users have the "employee" role in WordPress.',
      }, { status: 400 });
    }

    if (syncResult.synced === 0) {
      return NextResponse.json({
        success: false,
        error: 'No employees found with "employee" role in WordPress. Please check that users have the correct role assigned.',
      }, { status: 400 });
    }

    const existingWorkers = getWorkers();
    const wordpressEmails = new Set(syncResult.employees.map(e => e.email.toLowerCase()));
    
    let added = 0;
    let updated = 0;
    let removed = 0;

    // Add or update workers from WordPress
    for (const employee of syncResult.employees) {
      const exists = existingWorkers.some(w => w.email.toLowerCase() === employee.email.toLowerCase());
      
      addOrUpdateWorkerByEmail({
        name: employee.name,
        email: employee.email,
        wordpressId: employee.wordpressId,
        role: 'caller',
      });
      
      if (exists) {
        updated++;
      } else {
        added++;
      }
    }

    // Remove workers that are no longer in WordPress (only if they have a wordpressId)
    for (const worker of existingWorkers) {
      if (worker.wordpressId && !wordpressEmails.has(worker.email.toLowerCase())) {
        deleteWorker(worker.id);
        removed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResult.synced} employees from WordPress. Added ${added} new, updated ${updated}, removed ${removed}.`,
      added,
      updated,
      removed,
      total: syncResult.synced,
    });
  } catch (error) {
    console.error('WordPress sync error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync with WordPress',
    }, { status: 500 });
  }
}
