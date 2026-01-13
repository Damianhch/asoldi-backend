import { NextResponse } from 'next/server';
import { syncWordPressUsers, testWordPressConnection } from '@/lib/wordpress';
import { getWorkers, addWorker } from '@/lib/data';

export async function POST() {
  try {
    // Test connection first
    const connected = await testWordPressConnection();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Could not connect to WordPress. Check your credentials.',
      }, { status: 400 });
    }

    // Sync users
    const syncResult = await syncWordPressUsers();
    
    if (syncResult.errors.length > 0 && syncResult.synced === 0) {
      return NextResponse.json({
        success: false,
        error: syncResult.errors[0],
      }, { status: 400 });
    }

    // Get existing workers to avoid duplicates
    const existingWorkers = getWorkers();
    const existingEmails = new Set(existingWorkers.map(w => w.email.toLowerCase()));
    
    let added = 0;
    let skipped = 0;

    for (const user of syncResult.users) {
      if (existingEmails.has(user.email.toLowerCase())) {
        skipped++;
        continue;
      }

      // Add new worker
      addWorker({
        name: user.name,
        email: user.email,
        role: 'caller',
        status: 'onboarding',
        startDate: new Date().toISOString().split('T')[0],
        checklist: {
          contractSent: false,
          contractSigned: false,
          oneWeekMeeting: false,
          twoWeekMeeting: false,
          monthlyReview: false,
          trainingCompleted: false,
          systemAccessGranted: false,
          welcomeEmailSent: false,
          bankDetailsReceived: false,
          taxFormReceived: false,
        },
        myphonerStats: {
          totalCalls: 0,
          successfulCalls: 0,
          meetingsBooked: 0,
          winners: 0,
          conversionRate: 0,
        },
        paymentInfo: {
          hourlyRate: 160,
          commissionPerWinner: 500,
          totalOwed: 0,
          nextPayday: getNextPayday(),
          paymentMethod: 'bank',
        },
        notes: [],
      });
      
      added++;
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResult.synced} users from WordPress. Added ${added} new workers, skipped ${skipped} duplicates.`,
      added,
      skipped,
      errors: syncResult.errors,
    });
  } catch (error) {
    console.error('WordPress sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync with WordPress',
    }, { status: 500 });
  }
}

function getNextPayday(): string {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let nextPayday = new Date(currentYear, currentMonth, 25);
  
  if (today > nextPayday) {
    nextPayday = new Date(currentYear, currentMonth + 1, 25);
  }
  
  return nextPayday.toISOString().split('T')[0];
}


