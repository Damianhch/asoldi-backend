'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Worker, DashboardStats } from '@/lib/types';

export default function PaymentsPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeWorkers = workers.filter(w => w.status !== 'inactive');
  const totalOwed = activeWorkers.reduce((sum, w) => sum + (w.paymentInfo?.totalOwed || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-asoldi-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">
            Payments
          </h1>
          <p className="text-dark-400">
            Track payments and connect to Luca accounting
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Sync with Luca
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Owed</p>
              <p className="text-3xl font-bold text-white font-display">
                {totalOwed.toLocaleString()} kr
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-asoldi-500/20 border border-asoldi-500/30">
              <Calendar className="w-6 h-6 text-asoldi-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Next Payday</p>
              <p className="text-3xl font-bold text-white font-display">
                25th
              </p>
              <p className="text-sm text-dark-500">
                {stats?.daysUntilPayday || 0} days remaining
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <Clock className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Workers to Pay</p>
              <p className="text-3xl font-bold text-white font-display">
                {activeWorkers.filter(w => (w.paymentInfo?.totalOwed || 0) > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Luca Integration Status */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Luca Accounting Integration</h3>
              <p className="text-sm text-dark-400">
                Connect to sync payment data automatically
              </p>
            </div>
          </div>
          <span className="badge badge-warning">Not Connected</span>
        </div>
        
        <div className="mt-6 p-4 bg-dark-900 rounded-xl">
          <p className="text-dark-400 text-sm mb-4">
            Luca is a Norwegian accounting software. To integrate:
          </p>
          <ol className="list-decimal list-inside text-dark-400 text-sm space-y-2">
            <li>Generate a Personal API Key in Luca</li>
            <li>Add your API key in Settings</li>
            <li>Sync will automatically pull payment schedules</li>
          </ol>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Payment Breakdown
        </h2>
        
        {activeWorkers.length === 0 ? (
          <p className="text-dark-400 text-center py-8">
            No workers yet. Sync from WordPress to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-4 px-4 text-dark-400 font-medium">Worker</th>
                  <th className="text-center py-4 px-4 text-dark-400 font-medium">Hours Called</th>
                  <th className="text-center py-4 px-4 text-dark-400 font-medium">Meetings</th>
                  <th className="text-center py-4 px-4 text-dark-400 font-medium">Hourly Rate</th>
                  <th className="text-center py-4 px-4 text-dark-400 font-medium">Total Owed</th>
                  <th className="text-center py-4 px-4 text-dark-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {activeWorkers.map((worker) => {
                  const hours = worker.myphonerStats?.hoursCalled || 0;
                  const meetings = worker.myphonerStats?.meetingsBooked || 0;
                  
                  return (
                    <tr key={worker.id} className="border-b border-dark-800 hover:bg-dark-900/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-asoldi-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                            {worker.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{worker.name}</p>
                            <p className="text-sm text-dark-400">{worker.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 text-amber-400 font-medium">
                        {hours.toFixed(1)} hrs
                      </td>
                      <td className="text-center py-4 px-4 text-purple-400 font-medium">
                        {meetings}
                      </td>
                      <td className="text-center py-4 px-4 text-white">
                        {worker.paymentInfo?.hourlyRate || 0} kr/hr
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="text-lg font-bold text-asoldi-400">
                          {(worker.paymentInfo?.totalOwed || 0).toLocaleString()} kr
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        {worker.checklist.bankDetailsReceived ? (
                          <span className="badge badge-success flex items-center gap-1 justify-center">
                            <CheckCircle2 className="w-3 h-3" />
                            Ready
                          </span>
                        ) : (
                          <span className="badge badge-warning flex items-center gap-1 justify-center">
                            <AlertCircle className="w-3 h-3" />
                            Missing Info
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-dark-600">
                  <td colSpan={4} className="py-4 px-4 text-right font-semibold text-white">
                    Total:
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className="text-2xl font-bold text-asoldi-400">
                      {totalOwed.toLocaleString()} kr
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Recent Payments
        </h2>
        <p className="text-dark-400 text-center py-8">
          Payment history will appear here once connected to Luca
        </p>
      </div>
    </div>
  );
}
