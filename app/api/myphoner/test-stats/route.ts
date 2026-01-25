import { NextRequest, NextResponse } from 'next/server';
import { myphonerFetch, getCampaignIds } from '@/lib/myphoner';

// Test endpoint to check if /lists/{id}/stats provides agent-specific data
export async function GET(request: NextRequest) {
  try {
    const campaignIds = getCampaignIds();
    
    if (campaignIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No campaign IDs configured',
      });
    }
    
    const results: any = {};
    
    for (const campaignId of campaignIds) {
      const statsResponse = await myphonerFetch<any>(`/lists/${campaignId}/stats`);
      results[`list_${campaignId}`] = {
        success: statsResponse.success,
        data: statsResponse.data,
        error: statsResponse.error,
      };
    }
    
    return NextResponse.json({
      success: true,
      results,
      note: 'Check if stats endpoint provides agent-specific data or if we need to use webhooks',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
