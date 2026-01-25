import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Props {
  params: Promise<{ filename: string }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { filename } = await params;
    const filepath = path.join(process.cwd(), '.builds', 'uploads', 'contracts', filename);

    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { error: 'Contract not found' },
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
    return NextResponse.json(
      { error: 'Failed to serve contract' },
      { status: 500 }
    );
  }
}

