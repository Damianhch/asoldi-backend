'use client';

import { useState, useEffect } from 'react';
import {
  UserPlus,
  Phone,
  CreditCard,
  TrendingUp,
  Clock,
  Calendar,
  Users,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import Link from 'next/link';
import { Worker, DashboardStats, TIME_INTERVALS, TimeInterval } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setWorkers(data.workers || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncAll = async () => {
    setSyncing(true);
    try {
      // Sync WordPress first
      await fetch('/api/wordpress/sync', { method: 'POST' });
      // Then sync MyPhoner stats
      await fetch(`/api/workers/sync-all?interval=${timeInterval}`, { method: 'POST' });
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Get workers needing attention (incomplete checklists)
  const workersNeedingAttention = workers.filter(w => {
    const checklist = w.checklist;
    const incompleteItems = (Object.values(checklist) as boolean[]).filter(v => !v).length;
    return incompleteItems > 3 && w.status !== 'inactive';
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
            Dashboard
          </h1>
          <p className="text-dark-400">
            Welcome back! Here&apos;s what&apos;s happening with your team.
          </p>
        </div>
        <button
          onClick={syncAll}
          disabled={syncing}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          {syncing ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Sync All Data
        </button>
      </div>

      {/* Time Interval Selector */}
      <div className="glass-card p-4 animate-slide-up">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-dark-400 text-sm mr-2">Stats Period:</span>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Workers"
          value={stats?.activeWorkers || 0}
          subtitle={`${stats?.totalWorkers || 0} total`}
          iconName="users"
          color="green"
          delay={0}
        />
        <StatCard
          title="Meetings Booked"
          value={stats?.totalMeetingsThisMonth || 0}
          subtitle="This period"
          iconName="calendar"
          color="purple"
          delay={100}
        />
        <StatCard
          title="Hours Called"
          value={stats?.totalHoursThisMonth?.toFixed(1) || '0.0'}
          subtitle="This period"
          iconName="clock"
          color="amber"
          delay={200}
        />
        <StatCard
          title="Days Until Payday"
          value={stats?.daysUntilPayday || 0}
          subtitle="25th of the month"
          iconName="credit-card"
          color="blue"
          delay={300}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workers Needing Attention */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-display text-white">
              Needs Attention
            </h2>
            <Link
              href="/dashboard/workers"
              className="text-sm text-asoldi-400 hover:text-asoldi-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          
          {workersNeedingAttention.length === 0 ? (
            <p className="text-dark-400 text-center py-8">
              {workers.length === 0 
                ? 'No workers yet. Sync from WordPress to get started.'
                : 'All workers are up to date! 🎉'}
            </p>
          ) : (
            <div className="space-y-4">
              {workersNeedingAttention.slice(0, 5).map((worker) => {
                const incompleteItems = Object.entries(worker.checklist)
                  .filter(([, v]) => !v)
                  .map(([k]) => k);
                
                return (
                  <Link
                    key={worker.id}
                    href={`/dashboard/workers/${worker.id}`}
                    className="flex items-center justify-between p-4 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-dark-600 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-asoldi-500 to-blue-500 flex items-center justify-center text-white font-semibold">
                        {worker.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{worker.name}</p>
                        <p className="text-sm text-dark-400">
                          {incompleteItems.length} items pending
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-warning">
                      {worker.status}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-display text-white">
              Top Performers
            </h2>
            <TrendingUp className="w-5 h-5 text-asoldi-400" />
          </div>
          
          {workers.length === 0 ? (
            <p className="text-dark-400 text-center py-8">
              Sync workers to see top performers
            </p>
          ) : (
            <div className="space-y-4">
              {[...workers]
                .filter(w => w.status === 'active')
                .sort((a, b) => (b.myphonerStats?.meetingsBooked || 0) - (a.myphonerStats?.meetingsBooked || 0))
                .slice(0, 5)
                .map((worker, index) => (
                  <Link
                    key={worker.id}
                    href={`/dashboard/workers/${worker.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-800 transition-all"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-700 text-white' :
                      'bg-dark-700 text-dark-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{worker.name}</p>
                      <p className="text-sm text-dark-400">
                        {worker.myphonerStats?.meetingsBooked || 0} meetings
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-asoldi-400 font-bold">
                        {worker.myphonerStats?.conversionRate || 0}%
                      </p>
                      <p className="text-xs text-dark-500">conversion</p>
                    </div>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/workers"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-asoldi-500/50 transition-all group"
          >
            <Users className="w-8 h-8 text-dark-400 group-hover:text-asoldi-400 transition-colors" />
            <span className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
              View Workers
            </span>
          </Link>
          <Link
            href="/dashboard/myphoner"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-blue-500/50 transition-all group"
          >
            <Phone className="w-8 h-8 text-dark-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
              MyPhoner Stats
            </span>
          </Link>
          <Link
            href="/dashboard/income"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-purple-500/50 transition-all group"
          >
            <CreditCard className="w-8 h-8 text-dark-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
              Income
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
