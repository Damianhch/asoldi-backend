import { NextResponse } from 'next/server';
import { getAgents, testConnection } from '@/lib/myphoner';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Manually load .env file
    const envPaths = [
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '.env.local'),
    ];
    
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach((line: string) => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
              let key = match[1].trim();
              let value = match[2].trim();
              value = value.replace(/^["']|["']$/g, '');
              value = value.replace(/^\\"|\\"$/g, '');
              value = value.trim();
              if ((key === 'MYPHONER_API_KEY' || key === 'MYPHONER_SUBDOMAIN') && !process.env[key]) {
                process.env[key] = value;
              }
            }
          }
        });
        break;
      }
    }
    
    // Helper to clean env values
    const getEnvValue = (key: string, defaultValue = ''): string => {
      const value = process.env[key];
      if (!value) return defaultValue;
      let cleaned = value.trim();
      cleaned = cleaned.replace(/^["']|["']$/g, '');
      cleaned = cleaned.replace(/^\\"|\\"$/g, '');
      cleaned = cleaned.replace(/^\\'|\\'$/g, '');
      return cleaned.trim();
    };

    const apiKey = getEnvValue('MYPHONER_API_KEY');
    const subdomain = getEnvValue('MYPHONER_SUBDOMAIN', 'demo');
    const baseUrl = `https://${subdomain}.myphoner.com/api/v2`;
    
    const connected = await testConnection();
    const agentsResponse = await getAgents();
    
    return NextResponse.json({
      connected,
      apiKey: apiKey ? 'SET' : 'NOT SET',
      apiKeyLength: apiKey?.length || 0,
      subdomain: subdomain,
      rawSubdomain: process.env.MYPHONER_SUBDOMAIN || 'NOT SET',
      baseUrl: baseUrl,
      envFileExists: envPaths.some(p => fs.existsSync(p)),
      agents: {
        success: agentsResponse.success,
        count: agentsResponse.data?.length || 0,
        error: agentsResponse.error,
        sample: agentsResponse.data?.slice(0, 3).map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
        })) || [],
      },
    });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

