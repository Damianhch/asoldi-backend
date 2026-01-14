import { NextResponse } from 'next/server';
import { syncWordPressEmployees, testWordPressConnection } from '@/lib/wordpress';
import { addOrUpdateWorkerByEmail, getWorkers } from '@/lib/data';

export async function POST() {
  try {
    // Test connection first
    const connected = await testWordPressConnection();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Could not connect to WordPress. Check your credentials in Settings.',
      }, { status: 400 });
    }

    // Sync employees only (users with 'employee' role)
    const syncResult = await syncWordPressEmployees();
    
    if (syncResult.error && syncResult.synced === 0) {
      return NextResponse.json({
        success: false,
        error: syncResult.error,
      }, { status: 400 });
    }

    let added = 0;
    let updated = 0;

    for (const employee of syncResult.employees) {
      const existingWorkers = getWorkers();
      const exists = existingWorkers.some(w => w.email.toLowerCase() === employee.email.toLowerCase());
      
      addOrUpdateWorkerByEmail({
        name: employee.name,
        email: employee.email,
        wordpressId: employee.wordpressId,
        role: 'caller',
      });
      
      if (exists) {
        updated++;
      } else {
        added++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${syncResult.synced} employees from WordPress. Added ${added} new, updated ${updated}.`,
      added,
      updated,
      total: syncResult.synced,
    });
  } catch (error) {
    console.error('WordPress sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to sync with WordPress',
    }, { status: 500 });
  }
}
