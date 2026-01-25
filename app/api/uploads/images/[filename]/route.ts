import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Props {
  params: Promise<{ filename: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { filename } = await params;
    const filepath = path.join(process.cwd(), '.builds', 'uploads', 'images', filename);

    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filepath);
    const ext = path.extname(filename).toLowerCase();
    
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    );
  }
}

