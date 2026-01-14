'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Phone,
  Clock,
  TrendingUp,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import WorkerChecklist from '@/components/WorkerChecklist';
import WorkerNotes from '@/components/WorkerNotes';
import { Worker, TIME_INTERVALS, TimeInterval } from '@/lib/types';

export default function WorkerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');

  useEffect(() => {
    fetchWorker();
  }, [id]);

  useEffect(() => {
    if (worker) {
      syncStats();
    }
  }, [timeInterval]);

  const fetchWorker = async () => {
    try {
      const res = await fetch(`/api/workers/${id}`);
      const data = await res.json();
      if (data.success) {
        setWorker(data.worker);
      }
    } catch (error) {
      console.error('Failed to fetch worker:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncStats = async () => {
    if (!worker) return;
    setSyncing(true);
    
    try {
      const res = await fetch(`/api/workers/${id}/sync?interval=${timeInterval}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.worker) {
        setWorker(data.worker);
      }
    } catch (error) {
      console.error('Failed to sync stats:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'onboarding':
        return 'badge-warning';
      case 'inactive':
        return 'badge-danger';
      default:
        return 'badge-info';
    }
  };

  const checklistLabels: Record<string, string> = {
    contractSent: 'Contract Sent',
    contractSigned: 'Contract Signed',
    oneWeekMeeting: '1 Week Check-in Meeting',
    twoWeekMeeting: '2 Week Check-in Meeting',
    monthlyReview: 'Monthly Review',
    trainingCompleted: 'Training Completed',
    systemAccessGranted: 'System Access Granted',
    welcomeEmailSent: 'Welcome Email Sent',
    bankDetailsReceived: 'Bank Details Received',
    taxFormReceived: 'Tax Form Received',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-asoldi-400" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">Worker not found</p>
        <Link href="/dashboard/workers" className="text-asoldi-400 hover:underline mt-4 inline-block">
          Back to Workers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard/workers"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors animate-fade-in"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Workers
      </Link>

      {/* Header */}
      <div className="glass-card p-8 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-asoldi-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-asoldi-500/25">
              {worker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold font-display text-white">
                  {worker.name}
                </h1>
                <span className={`badge ${getStatusBadge(worker.status)}`}>
                  {worker.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-dark-400">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {worker.email}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Started {worker.startDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={syncStats}
              disabled={syncing}
              className="btn-secondary flex items-center gap-2"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Sync Stats
            </button>
          </div>
        </div>
      </div>

      {/* Time Interval Selector */}
      <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '50ms' }}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-dark-400 text-sm mr-2">Time Period:</span>
          {TIME_INTERVALS.map((interval) => (
            <button
              key={interval.value}
              onClick={() => setTimeInterval(interval.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeInterval === interval.value
                  ? 'bg-asoldi-500 text-white'
                  : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {interval.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row - Updated: Total Calls, Meetings Booked, Hours Called, Conversion Rate */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Phone className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.totalCalls || 0}
          </p>
          <p className="text-sm text-dark-400">Total Calls</p>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.meetingsBooked || 0}
          </p>
          <p className="text-sm text-dark-400">Meetings Booked</p>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.hoursCalled?.toFixed(1) || '0.0'}
          </p>
          <p className="text-sm text-dark-400">Hours Called</p>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
          <TrendingUp className="w-8 h-8 text-asoldi-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.conversionRate || 0}%
          </p>
          <p className="text-sm text-dark-400">Conversion Rate</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist - Takes 2 columns */}
        <div className="lg:col-span-2">
          <WorkerChecklist
            workerId={worker.id}
            checklist={worker.checklist}
            labels={checklistLabels}
          />
        </div>

        {/* Sync Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold font-display text-white">
                Sync Info
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Last Synced</span>
                <span className="text-white">
                  {worker.myphonerStats?.lastSyncDate || 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Time Period</span>
                <span className="text-white">
                  {TIME_INTERVALS.find(i => i.value === timeInterval)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Status</span>
                <span className={worker.myphonerStats ? 'text-asoldi-400' : 'text-amber-400'}>
                  {worker.myphonerStats ? 'Connected' : 'Not Synced'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <WorkerNotes workerId={worker.id} notes={worker.notes} />
    </div>
  );
}
