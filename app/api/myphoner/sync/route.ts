import { NextResponse } from 'next/server';
import { getWorkers, updateWorker } from '@/lib/data';
import { syncWorkerWithMyphoner } from '@/lib/myphoner';

export async function POST() {
  try {
    const workers = getWorkers();
    const results: { id: string; name: string; synced: boolean; error?: string }[] = [];

    // Get date range for this month
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const fromDate = firstOfMonth.toISOString().split('T')[0];
    const toDate = now.toISOString().split('T')[0];

    for (const worker of workers) {
      if (worker.status === 'inactive') {
        results.push({ id: worker.id, name: worker.name, synced: false, error: 'Inactive worker' });
        continue;
      }

      const stats = await syncWorkerWithMyphoner(worker.email, fromDate, toDate);

      if (stats) {
        updateWorker(worker.id, {
          myphonerStats: {
            ...worker.myphonerStats,
            ...stats,
            lastCallDate: toDate,
          },
        });
        results.push({ id: worker.id, name: worker.name, synced: true });
      } else {
        results.push({ 
          id: worker.id, 
          name: worker.name, 
          synced: false, 
          error: 'Agent not found in MyPhoner' 
        });
      }
    }

    const syncedCount = results.filter(r => r.synced).length;

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} of ${workers.length} workers`,
      results,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Sync failed' },
      { status: 500 }
    );
  }
}


