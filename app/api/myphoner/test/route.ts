import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/myphoner';

export async function GET() {
  const connected = await testConnection();
  
  return NextResponse.json({
    connected,
    lastSync: connected ? new Date().toISOString() : null,
    error: connected ? null : 'API key not configured or invalid',
  });
}


