import { NextRequest, NextResponse } from 'next/server';
import { getWorkerById, updateWorker, deleteWorker } from '@/lib/data';

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const worker = getWorkerById(id);
  
  if (!worker) {
    return NextResponse.json(
      { success: false, error: 'Worker not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, worker });
}

export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const worker = updateWorker(id, body);
    
    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, worker });
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update worker' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const deleted = deleteWorker(id);
  
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Worker not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true });
}


