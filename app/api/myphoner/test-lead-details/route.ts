import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getCampaignIds, myphonerFetch } from '@/lib/myphoner';

// Test endpoint to check if individual lead details have activity/history info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentEmail = searchParams.get('email') || 'moshirnxy@gmail.com';
    
    const campaignIds = getCampaignIds();
    const leadsResponse = await getLeads(campaignIds.length > 0 ? campaignIds : undefined, {});
    
    if (!leadsResponse.success || !leadsResponse.data) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch leads',
      });
    }
    
    // Get all non-new leads (leads that have been worked on)
    const workedLeads = leadsResponse.data.filter((lead: any) => {
      const state = (lead.state || lead.status || '').toLowerCase();
      return state !== 'new' && state !== '';
    });
    
    // Get a sample of leads worked on by this agent (currently claimed)
    const agentLeads = workedLeads.filter((lead: any) => {
      const claimedBy = lead.claimed_by;
      if (!claimedBy) return false;
      if (typeof claimedBy === 'string') {
        return claimedBy.toLowerCase() === agentEmail.toLowerCase();
      }
      return false;
    });
    
    // Get a sample of leads worked on but NOT currently claimed by this agent
    const otherWorkedLeads = workedLeads
      .filter((lead: any) => {
        const claimedBy = lead.claimed_by;
        return !claimedBy || (typeof claimedBy === 'string' && claimedBy.toLowerCase() !== agentEmail.toLowerCase());
      })
      .slice(0, 5); // Sample 5
    
    const results: any = {
      totalWorkedLeads: workedLeads.length,
      agentLeadsCount: agentLeads.length,
      sampleAgentLeads: [],
      sampleOtherLeads: [],
    };
    
    // Fetch detailed info for agent's leads
    for (const lead of agentLeads.slice(0, 3)) {
      try {
        const detailResponse = await myphonerFetch<any>(`/leads/${lead.id}`);
        if (detailResponse.success && detailResponse.data) {
          results.sampleAgentLeads.push({
            id: detailResponse.data.id,
            state: detailResponse.data.state,
            claimed_by: detailResponse.data.claimed_by,
            last_updated: detailResponse.data.last_updated,
            // Check for activity/history fields
            allKeys: Object.keys(detailResponse.data),
            // Look for any fields that might indicate who worked on it
            hasEvents: !!detailResponse.data.events,
            hasActivity: !!detailResponse.data.activity,
            hasHistory: !!detailResponse.data.history,
            hasComments: !!detailResponse.data.comments,
            hasCalls: !!detailResponse.data.calls,
          });
        }
      } catch (e) {
        // Skip
      }
    }
    
    // Fetch detailed info for other worked leads (to see if we can find agent info)
    for (const lead of otherWorkedLeads) {
      try {
        const detailResponse = await myphonerFetch<any>(`/leads/${lead.id}`);
        if (detailResponse.success && detailResponse.data) {
          results.sampleOtherLeads.push({
            id: detailResponse.data.id,
            state: detailResponse.data.state,
            claimed_by: detailResponse.data.claimed_by,
            last_updated: detailResponse.data.last_updated,
            allKeys: Object.keys(detailResponse.data),
            // Check if there's any way to identify who worked on it
            sampleData: {
              // Show a sample of the data structure
              ...Object.fromEntries(
                Object.entries(detailResponse.data).slice(0, 20)
              ),
            },
          });
        }
      } catch (e) {
        // Skip
      }
    }
    
    return NextResponse.json({
      success: true,
      agentEmail,
      results,
      note: 'Check if lead details have activity/history/events fields that show who worked on each lead',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
