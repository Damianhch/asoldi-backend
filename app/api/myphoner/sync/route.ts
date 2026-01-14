import { NextRequest, NextResponse } from 'next/server';
import { getWorkers, updateWorkerMyphonerStats } from '@/lib/data';
import { getAgentStatsByEmail } from '@/lib/myphoner';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const interval = searchParams.get('interval') || 'month';
  
  try {
    const workers = getWorkers();
    const results: { id: string; name: string; synced: boolean; error?: string }[] = [];

    for (const worker of workers) {
      if (worker.status === 'inactive') {
        results.push({ id: worker.id, name: worker.name, synced: false, error: 'Inactive worker' });
        continue;
      }

      const result = await getAgentStatsByEmail(worker.email, interval);

      if (result) {
        updateWorkerMyphonerStats(worker.id, result.stats);
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
