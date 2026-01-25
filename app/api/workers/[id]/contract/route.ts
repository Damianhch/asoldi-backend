import { NextRequest, NextResponse } from 'next/server';
import { getWorkerById, updateWorker } from '@/lib/data';
import fs from 'fs';
import path from 'path';

interface Props {
  params: Promise<{ id: string }>;
}

// Upload worker contract PDF
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const worker = getWorkerById(id);
    
    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('contract') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No contract file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), '.builds', 'uploads', 'contracts');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `${id}-contract-${Date.now()}.pdf`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filepath, buffer);

    // Update worker with contract URL
    const contractUrl = `/api/uploads/contracts/${filename}`;
    const updatedWorker = updateWorker(id, { contractUrl });

    return NextResponse.json({
      success: true,
      worker: updatedWorker,
      contractUrl,
    });
  } catch (error) {
    console.error('Contract upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload contract' },
      { status: 500 }
    );
  }
}

// Get contract file
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    const worker = getWorkerById(id);
    
    if (!worker || !worker.contractUrl) {
      return NextResponse.json(
        { success: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Extract filename from URL
    const filename = path.basename(worker.contractUrl);
    const filepath = path.join(process.cwd(), '.builds', 'uploads', 'contracts', filename);

    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { success: false, error: 'Contract file not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filepath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Contract retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve contract' },
      { status: 500 }
    );
  }
}

