import { NextResponse } from 'next/server';
import { syncWordPressEmployees, testWordPressConnection } from '@/lib/wordpress';
import { addOrUpdateWorkerByEmail, getWorkers } from '@/lib/data';

export async function POST() {
  try {
    // Check if WordPress credentials are configured
    if (!process.env.WORDPRESS_USERNAME || !process.env.WORDPRESS_APP_PASSWORD) {
      return NextResponse.json({
        success: false,
        error: 'WordPress credentials not configured. Please set WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD as environment variables in your server settings (Hostinger: Node.js app → Environment Variables).',
      }, { status: 400 });
    }

    // Test connection first
    const connected = await testWordPressConnection();
    
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Could not connect to WordPress. Please check:\n1. Your WordPress URL is correct\n2. Your username and App Password are correct\n3. Your WordPress site allows REST API access',
      }, { status: 400 });
    }

    // Sync employees only (users with 'employee' role)
    const syncResult = await syncWordPressEmployees();
    
    if (syncResult.error && syncResult.synced === 0) {
      return NextResponse.json({
        success: false,
        error: syncResult.error || 'No employees found. Make sure users have the "employee" role in WordPress.',
      }, { status: 400 });
    }

    if (syncResult.synced === 0) {
      return NextResponse.json({
        success: false,
        error: 'No employees found with "employee" role in WordPress. Please check that users have the correct role assigned.',
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
      error: error instanceof Error ? error.message : 'Failed to sync with WordPress',
    }, { status: 500 });
  }
}
