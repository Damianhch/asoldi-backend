import { NextRequest, NextResponse } from 'next/server';
import { getLeads, getCampaignIds, getMyPhonerConfig, myphonerFetch, getDateRange, getAgentStatsByEmail } from '@/lib/myphoner';
import { getWorkers } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testWorkerEmail = searchParams.get('email');
    
    const config = getMyPhonerConfig();
    const campaignIds = getCampaignIds();
    const workers = getWorkers();
    
    const results: any = {
      step1_apiConnection: {},
      step2_dataGathering: {},
      step3_dataMapping: {},
      step4_statsCalculation: {},
    };
    
    // STEP 1: Test API Connection
    console.log('🔍 STEP 1: Testing API Connection...');
    const listsResponse = await myphonerFetch<any[]>('/lists');
    results.step1_apiConnection = {
      success: listsResponse.success,
      error: listsResponse.error,
      listsFound: listsResponse.data?.length || 0,
      config: {
        subdomain: config.subdomain,
        hasApiKey: !!config.apiKey,
        campaignIds: campaignIds,
      },
    };
    
    if (!listsResponse.success) {
      return NextResponse.json({ success: false, error: 'API connection failed', results }, { status: 500 });
    }
    
    // STEP 2: Gather Data
    console.log('🔍 STEP 2: Gathering Data from Myphoner...');
    const leadsResponse = await getLeads(campaignIds.length > 0 ? campaignIds : undefined, {});
    
    // Get sample of leads with different states
    const sampleLeads = leadsResponse.data?.slice(0, 10) || [];
    const claimedLeads = leadsResponse.data?.filter((l: any) => l.claimed_by !== null && l.claimed_by !== undefined) || [];
    const nonNewLeads = leadsResponse.data?.filter((l: any) => (l.state || l.status || '').toLowerCase() !== 'new') || [];
    
    // Fetch detailed info for a few sample leads to see if claimed_by is in the full response
    const detailedSamples: any[] = [];
    if (leadsResponse.data && leadsResponse.data.length > 0) {
      for (let i = 0; i < Math.min(3, leadsResponse.data.length); i++) {
        const lead = leadsResponse.data[i];
        try {
          const detailResponse = await myphonerFetch<any>(`/leads/${lead.id}`);
          if (detailResponse.success && detailResponse.data) {
            detailedSamples.push({
              id: detailResponse.data.id,
              claimed_by: detailResponse.data.claimed_by,
              claimed_by_type: typeof detailResponse.data.claimed_by,
              state: detailResponse.data.state,
              category: detailResponse.data.category,
            });
          }
        } catch (e) {
          // Skip if error
        }
      }
    }
    
    results.step2_dataGathering = {
      success: leadsResponse.success,
      error: leadsResponse.error,
      totalLeads: leadsResponse.data?.length || 0,
      claimedLeads: claimedLeads.length,
      nonNewLeads: nonNewLeads.length,
      sampleLeads: sampleLeads.map((lead: any) => ({
        id: lead.id,
        claimed_by: lead.claimed_by,
        claimed_by_type: typeof lead.claimed_by,
        state: lead.state || lead.status,
        category: lead.category,
        created_at: lead.created_at,
        last_updated: lead.last_updated || lead.updated_at,
      })),
      detailedLeadSamples: detailedSamples,
      claimedByAnalysis: (() => {
        if (!leadsResponse.data) return null;
        const analysis: any = {
          total: leadsResponse.data.length,
          withClaimedBy: 0,
          claimedByTypes: {} as Record<string, number>,
          claimedByValues: [] as any[],
        };
        
        leadsResponse.data.forEach((lead: any) => {
          const claimedBy = lead.claimed_by;
          if (claimedBy !== null && claimedBy !== undefined) {
            analysis.withClaimedBy++;
            const type = typeof claimedBy;
            analysis.claimedByTypes[type] = (analysis.claimedByTypes[type] || 0) + 1;
            
            if (analysis.claimedByValues.length < 10) {
              analysis.claimedByValues.push({
                value: claimedBy,
                type: type,
                leadId: lead.id,
              });
            }
          }
        });
        
        return analysis;
      })(),
    };
    
    // STEP 3: Test Data Mapping
    console.log('🔍 STEP 3: Testing Data Mapping...');
    if (leadsResponse.success && leadsResponse.data && workers.length > 0) {
      const mappingResults: any[] = [];
      
      for (const worker of workers.slice(0, 3)) { // Test first 3 workers
        const workerLeads = leadsResponse.data.filter((lead: any) => {
          const claimedBy = lead.claimed_by;
          if (!claimedBy) return false;
          
          if (typeof claimedBy === 'string') {
            return claimedBy.toLowerCase() === worker.email.toLowerCase();
          }
          return false;
        });
        
        mappingResults.push({
          workerEmail: worker.email,
          workerName: worker.name,
          leadsMatched: workerLeads.length,
          sampleMatchedLeads: workerLeads.slice(0, 3).map((lead: any) => ({
            id: lead.id,
            claimed_by: lead.claimed_by,
            state: lead.state || lead.status,
            category: lead.category,
          })),
        });
      }
      
      results.step3_dataMapping = {
        workersTested: mappingResults.length,
        mappings: mappingResults,
      };
    }
    
    // STEP 4: Test Stats Calculation
    console.log('🔍 STEP 4: Testing Stats Calculation...');
    if (testWorkerEmail && leadsResponse.success && leadsResponse.data) {
      // Test using the actual getAgentStatsByEmail function
      const statsResponse = await getAgentStatsByEmail(testWorkerEmail, '1 mth');
      
      results.step4_statsCalculation = {
        workerEmail: testWorkerEmail,
        usingFunction: 'getAgentStatsByEmail',
        stats: statsResponse,
        dateRange: getDateRange('1 mth'),
      };
    } else if (workers.length > 0) {
      // Test with first worker
      const firstWorker = workers[0];
      const statsResponse = await getAgentStatsByEmail(firstWorker.email, '1 mth');
      
      results.step4_statsCalculation = {
        workerEmail: firstWorker.email,
        workerName: firstWorker.name,
        usingFunction: 'getAgentStatsByEmail',
        stats: statsResponse,
        dateRange: getDateRange('1 mth'),
      };
    }
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        apiConnected: results.step1_apiConnection.success,
        dataGathered: results.step2_dataGathering.success,
        leadsFound: results.step2_dataGathering.totalLeads,
        workersInSystem: workers.length,
      },
    });
  } catch (error) {
    console.error('Test full error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
