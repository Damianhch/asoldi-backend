'use client';

import { useState, useEffect } from 'react';
import {
  Phone,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Trophy,
  Calendar,
  TrendingUp,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { getWorkers } from '@/lib/data';

interface SyncStatus {
  connected: boolean;
  lastSync?: string;
  error?: string;
}

export default function MyphonerPage() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ connected: false });
  const [syncing, setSyncing] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch workers on mount
    fetchWorkers();
    checkConnection();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/workers');
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (error) {
      console.error('Failed to fetch workers:', error);
    }
  };

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/myphoner/test');
      const data = await res.json();
      setSyncStatus({
        connected: data.connected,
        lastSync: data.lastSync,
        error: data.error,
      });
    } catch (error) {
      setSyncStatus({ connected: false, error: 'Failed to check connection' });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/myphoner/sync', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setSyncStatus({
          connected: true,
          lastSync: new Date().toISOString(),
        });
        await fetchWorkers();
      } else {
        setSyncStatus({
          connected: false,
          error: data.error || 'Sync failed',
        });
      }
    } catch (error) {
      setSyncStatus({ connected: false, error: 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  const totalCalls = workers.reduce((sum, w) => sum + (w.myphonerStats?.totalCalls || 0), 0);
  const totalMeetings = workers.reduce((sum, w) => sum + (w.myphonerStats?.meetingsBooked || 0), 0);
  const totalWinners = workers.reduce((sum, w) => sum + (w.myphonerStats?.winners || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">
            MyPhoner Integration
          </h1>
          <p className="text-dark-400">
            Sync and view call statistics from MyPhoner
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          {syncing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              Sync Now
            </>
          )}
        </button>
      </div>

      {/* Connection Status */}
      <div className="glass-card p-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              syncStatus.connected 
                ? 'bg-asoldi-500/20 border border-asoldi-500/30' 
                : 'bg-red-500/20 border border-red-500/30'
            }`}>
              {syncStatus.connected ? (
                <CheckCircle2 className="w-6 h-6 text-asoldi-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {syncStatus.connected ? 'Connected to MyPhoner' : 'Not Connected'}
              </h3>
              {syncStatus.lastSync && (
                <p className="text-sm text-dark-400">
                  Last synced: {new Date(syncStatus.lastSync).toLocaleString()}
                </p>
              )}
              {syncStatus.error && (
                <p className="text-sm text-red-400">{syncStatus.error}</p>
              )}
            </div>
          </div>
          {!syncStatus.connected && (
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Configure API key in settings</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <Phone className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Calls</p>
              <p className="text-2xl font-bold text-white font-display">{totalCalls}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Meetings Booked</p>
              <p className="text-2xl font-bold text-white font-display">{totalMeetings}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Winners</p>
              <p className="text-2xl font-bold text-white font-display">{totalWinners}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-asoldi-500/20 border border-asoldi-500/30">
              <TrendingUp className="w-6 h-6 text-asoldi-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Avg Conversion</p>
              <p className="text-2xl font-bold text-white font-display">
                {totalCalls > 0 ? ((totalWinners / totalCalls) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Stats Table */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Agent Performance
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-4 px-4 text-dark-400 font-medium">Agent</th>
                <th className="text-center py-4 px-4 text-dark-400 font-medium">Total Calls</th>
                <th className="text-center py-4 px-4 text-dark-400 font-medium">Successful</th>
                <th className="text-center py-4 px-4 text-dark-400 font-medium">Meetings</th>
                <th className="text-center py-4 px-4 text-dark-400 font-medium">Winners</th>
                <th className="text-center py-4 px-4 text-dark-400 font-medium">Conversion</th>
                <th className="text-center py-4 px-4 text-dark-400 font-medium">Last Call</th>
              </tr>
            </thead>
            <tbody>
              {workers
                .filter(w => w.role === 'caller' && w.status !== 'inactive')
                .map((worker) => (
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
                    <td className="text-center py-4 px-4 text-white font-medium">
                      {worker.myphonerStats?.totalCalls || 0}
                    </td>
                    <td className="text-center py-4 px-4 text-white">
                      {worker.myphonerStats?.successfulCalls || 0}
                    </td>
                    <td className="text-center py-4 px-4 text-purple-400 font-medium">
                      {worker.myphonerStats?.meetingsBooked || 0}
                    </td>
                    <td className="text-center py-4 px-4 text-amber-400 font-medium">
                      {worker.myphonerStats?.winners || 0}
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className={`badge ${
                        (worker.myphonerStats?.conversionRate || 0) >= 15
                          ? 'badge-success'
                          : (worker.myphonerStats?.conversionRate || 0) >= 10
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}>
                        {worker.myphonerStats?.conversionRate || 0}%
                      </span>
                    </td>
                    <td className="text-center py-4 px-4 text-dark-400 text-sm">
                      {worker.myphonerStats?.lastCallDate || 'N/A'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* API Configuration Note */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <h3 className="font-semibold text-white mb-4">Configuration</h3>
        <p className="text-dark-400 mb-4">
          To connect to MyPhoner, add your API key to the environment variables:
        </p>
        <div className="p-4 bg-dark-900 rounded-xl font-mono text-sm">
          <p className="text-asoldi-400">MYPHONER_API_KEY=your-api-key-here</p>
          <p className="text-blue-400">MYPHONER_CAMPAIGN_ID=your-campaign-id</p>
        </div>
        <p className="text-dark-500 text-sm mt-4">
          Get your API key from MyPhoner Settings → API → Generate Key
        </p>
      </div>
    </div>
  );
}


