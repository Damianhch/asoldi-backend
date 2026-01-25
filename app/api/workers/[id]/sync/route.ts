import { NextRequest, NextResponse } from 'next/server';
import { getWorkerById, updateWorker } from '@/lib/data';
import { getAgentStatsByEmail } from '@/lib/myphoner';

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const interval = searchParams.get('interval') || 'month';
  
  try {
    const worker = getWorkerById(id);
    
    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Get stats from MyPhoner
    const result = await getAgentStatsByEmail(worker.email, interval);
    
    if (!result) {
      return NextResponse.json({
        success: true,
        worker,
        message: 'Worker not found in MyPhoner or no data available',
      });
    }

    // Update worker with new stats and MyPhoner creation date if WordPress date not available
    const updates: any = { 
      myphonerStats: {
        ...result.stats,
        lastSyncDate: new Date().toISOString().split('T')[0],
      }
    };
    if (result.createdAt && !worker.wordpressCreatedAt) {
      updates.startDate = result.createdAt;
    }

    const updatedWorker = updateWorker(id, updates);

    return NextResponse.json({
      success: true,
      worker: updatedWorker,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync worker stats' },
      { status: 500 }
    );
  }
}

