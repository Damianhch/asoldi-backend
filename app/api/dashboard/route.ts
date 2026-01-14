import { NextResponse } from 'next/server';
import { getWorkers, getDashboardStats } from '@/lib/data';

export async function GET() {
  try {
    const workers = getWorkers();
    const stats = getDashboardStats();

    return NextResponse.json({
      success: true,
      stats,
      workers,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

