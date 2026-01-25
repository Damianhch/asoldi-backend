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
          
          // Note: We don't track calls/hours in real-time anymore
          // Only meetings (winners) are tracked via webhooks
          // This webhook is kept for future use if needed
          console.log(`📞 Call webhook received for ${userEmail}, duration: ${duration}s`);
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
                meetingsBooked: 0,
              };
              
              const newMeetingsBooked = currentStats.meetingsBooked + 1;
              
              updateWorkerMyphonerStats(worker.id, {
                meetingsBooked: newMeetingsBooked,
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
