'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  FileText,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

interface IncomeSummary {
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  pendingAmount: number;
}

export default function IncomePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<IncomeSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Test connection first
      const testRes = await fetch('/api/luca/test');
      const testData = await testRes.json();
      setConnected(testData.connected);

      if (!testData.connected) {
        setError('Not connected to Luca. Add your API key as LUCA_API_KEY environment variable in Hostinger.');
        setLoading(false);
        return;
      }

      // Fetch invoices
      const res = await fetch('/api/luca/invoices');
      const data = await res.json();

      if (data.success) {
        setInvoices(data.invoices || []);
        setSummary(data.summary);
      } else {
        setError(data.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError('Failed to connect to Luca');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">
            Income Statement
          </h1>
          <p className="text-dark-400">
            Revenue and invoice data from Luca Regnskap
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Refresh
        </button>
      </div>

      {/* Connection Status */}
      <div className={`glass-card p-4 flex items-center gap-4 ${connected ? 'border-asoldi-500/30' : 'border-amber-500/30'}`}>
        {connected ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-asoldi-400" />
            <span className="text-asoldi-400">Connected to Luca Regnskap</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400">Not connected - Add LUCA_API_KEY environment variable in Hostinger</span>
          </>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-asoldi-500/20 border border-asoldi-500/30">
                <DollarSign className="w-6 h-6 text-asoldi-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white font-display">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Paid Invoices</p>
                <p className="text-2xl font-bold text-white font-display">
                  {summary.paidInvoices}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Unpaid Invoices</p>
                <p className="text-2xl font-bold text-white font-display">
                  {summary.unpaidInvoices}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Pending Amount</p>
                <p className="text-2xl font-bold text-white font-display">
                  {formatCurrency(summary.pendingAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Table */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold font-display text-white">
            Invoices
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-asoldi-400" />
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-dark-400 text-center py-12">
            {connected ? 'No invoices found' : 'Connect to Luca to see invoices'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-4 px-4 text-dark-400 font-medium">Invoice #</th>
                  <th className="text-left py-4 px-4 text-dark-400 font-medium">Customer</th>
                  <th className="text-right py-4 px-4 text-dark-400 font-medium">Amount</th>
                  <th className="text-right py-4 px-4 text-dark-400 font-medium">Paid</th>
                  <th className="text-center py-4 px-4 text-dark-400 font-medium">Status</th>
                  <th className="text-center py-4 px-4 text-dark-400 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-dark-800 hover:bg-dark-900/50">
                    <td className="py-4 px-4 text-white font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="py-4 px-4 text-white">
                      {invoice.customerName}
                    </td>
                    <td className="py-4 px-4 text-right text-white">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-right text-asoldi-400 font-medium">
                      {formatCurrency(invoice.paidAmount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`badge ${
                        invoice.paidAmount >= invoice.totalAmount
                          ? 'badge-success'
                          : invoice.paidAmount > 0
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}>
                        {invoice.paidAmount >= invoice.totalAmount ? 'Paid' : 
                         invoice.paidAmount > 0 ? 'Partial' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-dark-400">
                      {new Date(invoice.createdAt).toLocaleDateString('nb-NO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

