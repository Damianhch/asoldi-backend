import { NextResponse } from 'next/server';
import { getLists } from '@/lib/myphoner';

export async function GET() {
  try {
    const listsResponse = await getLists();
    
    return NextResponse.json({
      success: listsResponse.success,
      lists: listsResponse.data || [],
      count: listsResponse.data?.length || 0,
      error: listsResponse.error,
      message: listsResponse.success 
        ? `Found ${listsResponse.data?.length || 0} lists/campaigns. Use one of these IDs for MYPHONER_CAMPAIGN_ID in .env`
        : 'Failed to get lists. Check your API key and subdomain.',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
