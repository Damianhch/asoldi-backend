import { NextResponse } from 'next/server';
import { getCustomersWithRevenue } from '@/lib/luca';

export async function GET() {
  try {
    const response = await getCustomersWithRevenue();

    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      customers: response.data || [],
    });
  } catch (error) {
    console.error('Luca customers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

