import { NextRequest, NextResponse } from 'next/server';
import { getWorkers, addWorker } from '@/lib/data';
import { Worker } from '@/lib/types';

export async function GET() {
  const workers = getWorkers();
  return NextResponse.json({ success: true, workers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newWorker = addWorker({
      name: body.name,
      email: body.email,
      phone: body.phone,
      role: body.role || 'caller',
      status: 'onboarding',
      startDate: new Date().toISOString().split('T')[0],
      checklist: {
        contractSent: false,
        contractSigned: false,
        oneWeekMeeting: false,
        twoWeekMeeting: false,
        monthlyReview: false,
        trainingCompleted: false,
        systemAccessGranted: false,
        welcomeEmailSent: false,
        bankDetailsReceived: false,
        taxFormReceived: false,
      },
      myphonerStats: {
        totalCalls: 0,
        successfulCalls: 0,
        meetingsBooked: 0,
        winners: 0,
        conversionRate: 0,
      },
      paymentInfo: {
        hourlyRate: body.hourlyRate || 160,
        commissionPerWinner: body.commissionPerWinner || 500,
        totalOwed: 0,
        nextPayday: getNextPayday(),
        paymentMethod: 'bank',
      },
      notes: [],
    });

    return NextResponse.json({ success: true, worker: newWorker });
  } catch (error) {
    console.error('Error adding worker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add worker' },
      { status: 500 }
    );
  }
}

function getNextPayday(): string {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let nextPayday = new Date(currentYear, currentMonth, 25);
  
  if (today > nextPayday) {
    nextPayday = new Date(currentYear, currentMonth + 1, 25);
  }
  
  return nextPayday.toISOString().split('T')[0];
}


