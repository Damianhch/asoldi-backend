import { NextRequest, NextResponse } from 'next/server';
import { updateWorkerChecklist } from '@/lib/data';
import { Worker } from '@/lib/types';

interface Props {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  
  try {
    const { key, value } = await request.json();
    
    if (typeof key !== 'string' || typeof value !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }
    
    const worker = updateWorkerChecklist(id, key as keyof Worker['checklist'], value);
    
    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, checklist: worker.checklist });
  } catch (error) {
    console.error('Error updating checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update checklist' },
      { status: 500 }
    );
  }
}


