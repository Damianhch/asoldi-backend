import { NextRequest, NextResponse } from 'next/server';
import { getWorkerById, updateWorker } from '@/lib/data';
import fs from 'fs';
import path from 'path';

interface Props {
  params: Promise<{ id: string }>;
}

// Upload worker image
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
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), '.builds', 'uploads', 'images');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name);
    const filename = `${id}-${Date.now()}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filepath, buffer);

    // Update worker with image URL
    const imageUrl = `/api/uploads/images/${filename}`;
    const updatedWorker = updateWorker(id, { avatarUrl: imageUrl });

    return NextResponse.json({
      success: true,
      worker: updatedWorker,
      imageUrl,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

