import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getCampaignIds, getMyPhonerConfig } from '@/lib/myphoner';
import { getWorkers } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerEmail = searchParams.get('email');
    
    const config = getMyPhonerConfig();
    const campaignIds = getCampaignIds();
    const workers = getWorkers();
    
    // Get sample leads to see structure
    const leadsResponse = await getLeads(campaignIds.length > 0 ? campaignIds : undefined, {});
    
    // Get a sample lead to inspect structure
    const sampleLead = leadsResponse.data?.[0];
    
    // If worker email provided, filter leads for that worker
    let workerLeads: any[] = [];
    if (workerEmail && leadsResponse.success && leadsResponse.data) {
      workerLeads = leadsResponse.data.filter((lead: any) => {
        const claimedBy = lead.claimed_by;
        if (!claimedBy) return false;
        
        if (typeof claimedBy === 'string') {
          return claimedBy.toLowerCase() === workerEmail.toLowerCase();
        }
        return false;
      });
    }
    
    return NextResponse.json({
      success: true,
      config: {
        subdomain: config.subdomain,
        hasApiKey: !!config.apiKey,
        campaignIds: campaignIds,
      },
      leads: {
        total: leadsResponse.data?.length || 0,
        success: leadsResponse.success,
        error: leadsResponse.error,
        sampleLead: sampleLead ? {
          id: sampleLead.id,
          claimed_by: sampleLead.claimed_by,
          claimed_by_type: typeof sampleLead.claimed_by,
          state: sampleLead.state || sampleLead.status,
          category: sampleLead.category,
          created_at: sampleLead.created_at,
          last_updated: sampleLead.last_updated || sampleLead.updated_at,
          lead_data: sampleLead.lead_data,
        } : null,
      },
      workers: {
        total: workers.length,
        emails: workers.map(w => w.email),
      },
      workerLeads: workerEmail ? {
        email: workerEmail,
        count: workerLeads.length,
        sample: workerLeads.slice(0, 5).map((lead: any) => ({
          id: lead.id,
          claimed_by: lead.claimed_by,
          state: lead.state || lead.status,
          category: lead.category,
        })),
      } : null,
    });
  } catch (error) {
    console.error('Test data error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
