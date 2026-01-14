'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Phone,
  Clock,
  Calendar,
  Loader2,
} from 'lucide-react';
import { Worker, DashboardStats, TIME_INTERVALS, TimeInterval } from '@/lib/types';

export default function ReportsPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');

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

  const activeWorkers = workers.filter(w => w.status === 'active');
  
  // Calculate team averages
  const avgCalls = activeWorkers.length > 0
    ? Math.round(activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.totalCalls || 0), 0) / activeWorkers.length)
    : 0;
  
  const avgMeetings = activeWorkers.length > 0
    ? Math.round(activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.meetingsBooked || 0), 0) / activeWorkers.length)
    : 0;
  
  const avgHours = activeWorkers.length > 0
    ? (activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.hoursCalled || 0), 0) / activeWorkers.length).toFixed(1)
    : '0.0';

  const avgConversion = activeWorkers.length > 0
    ? (activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.conversionRate || 0), 0) / activeWorkers.length).toFixed(1)
    : '0.0';

  // Top performers (by meetings booked)
  const topPerformers = [...workers]
    .filter(w => w.status === 'active')
    .sort((a, b) => (b.myphonerStats?.meetingsBooked || 0) - (a.myphonerStats?.meetingsBooked || 0))
    .slice(0, 3);

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
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold font-display text-white mb-2">
          Reports & Analytics
        </h1>
        <p className="text-dark-400">
          Team performance insights and trends
        </p>
      </div>

      {/* Time Interval Selector */}
      <div className="glass-card p-4 animate-slide-up">
        <div className="flex flex-wrap items-center gap-2">
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

      {/* Team Averages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <Phone className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm text-dark-400 mb-1">Avg. Calls/Worker</p>
          <p className="text-3xl font-bold text-white font-display">{avgCalls}</p>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-6 h-6 text-purple-400" />
          </div>
          <p className="text-sm text-dark-400 mb-1">Avg. Meetings/Worker</p>
          <p className="text-3xl font-bold text-white font-display">{avgMeetings}</p>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-sm text-dark-400 mb-1">Avg. Hours/Worker</p>
          <p className="text-3xl font-bold text-white font-display">{avgHours}</p>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-asoldi-400" />
          </div>
          <p className="text-sm text-dark-400 mb-1">Team Conversion Rate</p>
          <p className="text-3xl font-bold text-white font-display">{avgConversion}%</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          🏆 Top Performers (by Meetings)
        </h2>
        
        {topPerformers.length === 0 ? (
          <p className="text-dark-400 text-center py-8">
            No active workers yet. Sync from WordPress to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPerformers.map((worker, index) => (
              <div
                key={worker.id}
                className={`p-6 rounded-xl border ${
                  index === 0
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30'
                    : index === 1
                    ? 'bg-gradient-to-br from-gray-400/20 to-gray-500/10 border-gray-400/30'
                    : 'bg-gradient-to-br from-orange-700/20 to-orange-800/10 border-orange-700/30'
                }`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold ${
                    index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    'bg-orange-700 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{worker.name}</p>
                    <p className="text-sm text-dark-400">{worker.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {worker.myphonerStats?.meetingsBooked || 0}
                    </p>
                    <p className="text-xs text-dark-400">Meetings</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {worker.myphonerStats?.conversionRate || 0}%
                    </p>
                    <p className="text-xs text-dark-400">Conversion</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Performance Trends
        </h2>
        
        <div className="h-64 flex items-center justify-center border border-dark-700 rounded-xl bg-dark-900/50">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400">
              Charts will appear here with more data
            </p>
            <p className="text-sm text-dark-500 mt-2">
              Connect to MyPhoner and sync regularly to see trends
            </p>
          </div>
        </div>
      </div>

      {/* Worker Comparison */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Worker Comparison (Meetings Booked)
        </h2>
        
        {activeWorkers.length === 0 ? (
          <p className="text-dark-400 text-center py-8">
            No active workers to compare
          </p>
        ) : (
          <div className="space-y-4">
            {activeWorkers.map((worker) => {
              const maxMeetings = Math.max(...activeWorkers.map(w => w.myphonerStats?.meetingsBooked || 0));
              const percentage = maxMeetings > 0 
                ? ((worker.myphonerStats?.meetingsBooked || 0) / maxMeetings) * 100 
                : 0;
              
              return (
                <div key={worker.id} className="flex items-center gap-4">
                  <div className="w-32 flex-shrink-0">
                    <p className="font-medium text-white truncate">{worker.name}</p>
                  </div>
                  <div className="flex-1 h-8 bg-dark-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-asoldi-500 to-blue-500 rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        {worker.myphonerStats?.meetingsBooked || 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <span className="text-sm text-dark-400">
                      {worker.myphonerStats?.conversionRate || 0}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
