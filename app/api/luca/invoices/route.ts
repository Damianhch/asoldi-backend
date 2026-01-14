import { NextResponse } from 'next/server';
import { getPaidInvoices, getIncomeSummary } from '@/lib/luca';

export async function GET() {
  try {
    const [invoicesRes, summaryRes] = await Promise.all([
      getPaidInvoices(),
      getIncomeSummary(),
    ]);

    return NextResponse.json({
      success: true,
      invoices: invoicesRes.data || [],
      summary: summaryRes.data || null,
      errors: {
        invoices: invoicesRes.error,
        summary: summaryRes.error,
      },
    });
  } catch (error) {
    console.error('Luca invoices error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

