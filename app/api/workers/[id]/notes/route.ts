import { NextRequest, NextResponse } from 'next/server';
import { addWorkerNote, getWorkerById } from '@/lib/data';

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
  
  return NextResponse.json({ success: true, notes: worker.notes });
}

export async function POST(request: NextRequest, { params }: Props) {
  const { id } = await params;
  
  try {
    const { content } = await request.json();
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }
    
    const worker = addWorkerNote(id, content, 'admin');
    
    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }
    
    const newNote = worker.notes[worker.notes.length - 1];
    
    return NextResponse.json({ success: true, note: newNote });
  } catch (error) {
    console.error('Error adding note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add note' },
      { status: 500 }
    );
  }
}


