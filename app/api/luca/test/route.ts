import { NextResponse } from 'next/server';
import { testLucaConnection } from '@/lib/luca';

export async function GET() {
  const connected = await testLucaConnection();
  
  return NextResponse.json({
    connected,
    error: connected ? null : 'Could not connect to Luca. Check your API key.',
  });
}

