import { NextRequest, NextResponse } from 'next/server';
import { myphonerFetch } from '@/lib/myphoner';
import { addUserMapping } from '@/lib/myphoner-user-mapping';
import { getWorkers, updateWorkerMyphonerStats } from '@/lib/data';

// Myphoner webhook endpoint
// Receives notifications for: new_call, new_recording, winner, loser, etc.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resource_url } = body;
    
    console.log('🔔 Myphoner webhook received:', { resource_url });
    
    if (!resource_url) {
      return NextResponse.json({ success: false, error: 'Missing resource_url' }, { status: 400 });
    }
    
    // Extract the resource type and ID from the URL
    // Example: /api/v2/leads/13722820 or /api/v2/calls/12345
    const urlMatch = resource_url.match(/\/api\/v2\/(\w+)\/(\d+)/);
    if (!urlMatch) {
      console.warn('⚠️ Could not parse resource_url:', resource_url);
      return NextResponse.json({ success: true }); // Return 200 to acknowledge
    }
    
    const [, resourceType, resourceId] = urlMatch;
    
    // Handle different resource types
    if (resourceType === 'calls') {
      // Fetch call details to get user_email and duration
      const callResponse = await myphonerFetch<any>(`/calls/${resourceId}/`);
      
      if (callResponse.success && callResponse.data) {
        const call = callResponse.data;
        const userEmail = call.user_email;
        const duration = call.duration || 0; // Duration in seconds
        
        console.log(`📞 Call webhook: user_email=${userEmail}, duration=${duration}s`);
        
        // Note: We don't have user_id from call data, but we have user_email
        // We can match this to workers and update their stats
        if (userEmail) {
          const workers = getWorkers();
          const worker = workers.find(w => w.email.toLowerCase() === userEmail.toLowerCase());
          
          if (worker) {
            // Update worker stats with this call
            const currentStats = worker.myphonerStats || {
              totalCalls: 0,
              meetingsBooked: 0,
              hoursCalled: 0,
              conversionRate: 0,
            };
            
            // Increment calls and add hours
            const newTotalCalls = currentStats.totalCalls + 1;
            const newHoursCalled = currentStats.hoursCalled + (duration / 3600);
            const newConversionRate = currentStats.meetingsBooked > 0 
              ? ((currentStats.meetingsBooked / newTotalCalls) * 100).toFixed(1)
              : 0;
            
            updateWorkerMyphonerStats(worker.id, {
              totalCalls: newTotalCalls,
              meetingsBooked: currentStats.meetingsBooked,
              hoursCalled: Number(newHoursCalled.toFixed(1)),
              conversionRate: Number(newConversionRate),
            });
            
            console.log(`✅ Updated stats for ${worker.email}: ${newTotalCalls} calls, ${newHoursCalled.toFixed(1)}h`);
          }
        }
      }
    } else if (resourceType === 'leads') {
      // Fetch lead details
      const leadResponse = await myphonerFetch<any>(`/leads/${resourceId}`);
      
      if (leadResponse.success && leadResponse.data) {
        const lead = leadResponse.data;
        const claimedBy = lead.claimed_by;
        
        // If claimed_by is a number (user ID), we need to map it
        // But we don't have email from lead data alone
        // We'll need to get it from call webhooks or manual mapping
        
        // Check if lead is a winner (meeting booked)
        const state = (lead.state || '').toLowerCase();
        const category = (lead.category || '').toLowerCase();
        const isWinner = state === 'won' || category === 'winner';
        
        if (isWinner) {
          console.log(`🏆 Winner webhook for lead ${resourceId}`);
          
          // Try to find worker by claimed_by
          let workerEmail: string | null = null;
          
          if (typeof claimedBy === 'string') {
            workerEmail = claimedBy;
          } else if (typeof claimedBy === 'number') {
            const { getEmailByUserId } = await import('@/lib/myphoner-user-mapping');
            workerEmail = getEmailByUserId(claimedBy);
          }
          
          if (workerEmail) {
            const workers = getWorkers();
            const worker = workers.find(w => w.email.toLowerCase() === workerEmail!.toLowerCase());
            
            if (worker) {
              const currentStats = worker.myphonerStats || {
                totalCalls: 0,
                meetingsBooked: 0,
                hoursCalled: 0,
                conversionRate: 0,
              };
              
              const newMeetingsBooked = currentStats.meetingsBooked + 1;
              const newConversionRate = currentStats.totalCalls > 0
                ? ((newMeetingsBooked / currentStats.totalCalls) * 100).toFixed(1)
                : 0;
              
              updateWorkerMyphonerStats(worker.id, {
                totalCalls: currentStats.totalCalls,
                meetingsBooked: newMeetingsBooked,
                hoursCalled: currentStats.hoursCalled,
                conversionRate: Number(newConversionRate),
              });
              
              console.log(`✅ Updated meetings for ${worker.email}: ${newMeetingsBooked} meetings`);
            }
          }
        }
      }
    }
    
    // Always return 200 to acknowledge webhook
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    // Return 200 anyway to prevent Myphoner from retrying
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
