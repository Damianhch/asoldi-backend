'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Worker, TIME_INTERVALS, TimeInterval, WorkerChecklist } from '@/lib/types';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');
  const [filter, setFilter] = useState<'all' | 'active' | 'onboarding' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers || []);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAllWorkers = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`/api/workers/sync-all?interval=${timeInterval}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        await fetchWorkers();
      }
    } catch (error) {
      console.error('Failed to sync workers:', error);
    } finally {
      setSyncing(false);
    }
  };

  const syncFromWordPress = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/wordpress/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchWorkers();
      }
    } catch (error) {
      console.error('Failed to sync from WordPress:', error);
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

  const getChecklistProgress = (checklist: WorkerChecklist) => {
    const values = Object.values(checklist) as boolean[];
    const total = values.length;
    const completed = values.filter(Boolean).length;
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  // Filter workers
  const filteredWorkers = workers.filter(worker => {
    // Status filter
    if (filter !== 'all' && worker.status !== filter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        worker.name.toLowerCase().includes(query) ||
        worker.email.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

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
            Workers
          </h1>
          <p className="text-dark-400">
            Manage your team members and track their progress
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={syncFromWordPress}
            disabled={syncing}
            className="btn-secondary flex items-center gap-2"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
            Sync WordPress
          </button>
          <button 
            onClick={syncAllWorkers}
            disabled={syncing}
            className="btn-primary flex items-center gap-2"
          >
            {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Sync MyPhoner
          </button>
        </div>
      </div>

      {/* Time Interval Selector */}
      <div className="glass-card p-4 animate-slide-up">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-dark-400 text-sm mr-2">Time Period:</span>
          {TIME_INTERVALS.map((interval) => (
            <button
              key={interval.value}
              onClick={() => setTimeInterval(interval.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
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

      {/* Search & Filters */}
      <div className="glass-card p-4 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'onboarding', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`btn-secondary text-sm capitalize ${
                  filter === status ? 'bg-dark-700 border-asoldi-500/50' : 'opacity-60 hover:opacity-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      {filteredWorkers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <p className="text-dark-400 mb-4">
            {workers.length === 0 
              ? 'No workers yet. Sync from WordPress to get started.'
              : 'No workers match your filters.'}
          </p>
          {workers.length === 0 && (
            <button onClick={syncFromWordPress} className="btn-primary">
              Sync from WordPress
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWorkers.map((worker, index) => {
            const progress = getChecklistProgress(worker.checklist);
            
            return (
              <Link
                key={worker.id}
                href={`/dashboard/workers/${worker.id}`}
                className="glass-card p-6 hover:border-asoldi-500/30 transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-asoldi-500 to-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-asoldi-500/25">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-asoldi-400 transition-colors">
                        {worker.name}
                      </h3>
                      <p className="text-sm text-dark-400">{worker.email}</p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadge(worker.status)}`}>
                    {worker.status}
                  </span>
                </div>

                {/* Stats - Updated: Calls, Meetings, Hours Called */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                    <Phone className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">
                      {worker.myphonerStats?.totalCalls || 0}
                    </p>
                    <p className="text-xs text-dark-500">Calls</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                    <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">
                      {worker.myphonerStats?.meetingsBooked || 0}
                    </p>
                    <p className="text-xs text-dark-500">Meetings</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                    <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-white">
                      {worker.myphonerStats?.hoursCalled?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-xs text-dark-500">Hours</p>
                  </div>
                </div>

                {/* Checklist Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-dark-400 flex items-center gap-2">
                      {progress.percentage === 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-asoldi-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                      )}
                      Checklist Progress
                    </span>
                    <span className="text-white font-medium">
                      {progress.completed}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress.percentage === 100
                          ? 'bg-asoldi-500'
                          : progress.percentage >= 50
                          ? 'bg-blue-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between">
                  <span className="text-sm text-dark-400">Conversion Rate</span>
                  <span className="text-lg font-bold text-asoldi-400">
                    {worker.myphonerStats?.conversionRate || 0}%
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
