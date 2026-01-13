import { getWorkers, getDashboardStats } from '@/lib/data';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  Trophy,
  Calendar,
} from 'lucide-react';

export default function ReportsPage() {
  const workers = getWorkers();
  const stats = getDashboardStats();
  
  const activeWorkers = workers.filter(w => w.status === 'active');
  
  // Calculate team averages
  const avgCalls = activeWorkers.length > 0
    ? Math.round(activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.totalCalls || 0), 0) / activeWorkers.length)
    : 0;
  
  const avgMeetings = activeWorkers.length > 0
    ? Math.round(activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.meetingsBooked || 0), 0) / activeWorkers.length)
    : 0;
  
  const avgWinners = activeWorkers.length > 0
    ? Math.round(activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.winners || 0), 0) / activeWorkers.length)
    : 0;

  const avgConversion = activeWorkers.length > 0
    ? (activeWorkers.reduce((sum, w) => sum + (w.myphonerStats?.conversionRate || 0), 0) / activeWorkers.length).toFixed(1)
    : 0;

  // Top performers
  const topPerformers = [...workers]
    .filter(w => w.status === 'active')
    .sort((a, b) => (b.myphonerStats?.winners || 0) - (a.myphonerStats?.winners || 0))
    .slice(0, 3);

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

      {/* Team Averages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <Phone className="w-6 h-6 text-blue-400" />
            <span className="text-asoldi-400 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +12%
            </span>
          </div>
          <p className="text-sm text-dark-400 mb-1">Avg. Calls/Worker</p>
          <p className="text-3xl font-bold text-white font-display">{avgCalls}</p>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-6 h-6 text-purple-400" />
            <span className="text-asoldi-400 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +8%
            </span>
          </div>
          <p className="text-sm text-dark-400 mb-1">Avg. Meetings/Worker</p>
          <p className="text-3xl font-bold text-white font-display">{avgMeetings}</p>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span className="text-asoldi-400 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +15%
            </span>
          </div>
          <p className="text-sm text-dark-400 mb-1">Avg. Winners/Worker</p>
          <p className="text-3xl font-bold text-white font-display">{avgWinners}</p>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-6 h-6 text-asoldi-400" />
            <span className="text-asoldi-400 text-sm flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +2%
            </span>
          </div>
          <p className="text-sm text-dark-400 mb-1">Team Conversion Rate</p>
          <p className="text-3xl font-bold text-white font-display">{avgConversion}%</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          🏆 Top Performers
        </h2>
        
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
                  <p className="text-sm text-dark-400">{worker.role}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">
                    {worker.myphonerStats?.winners || 0}
                  </p>
                  <p className="text-xs text-dark-400">Winners</p>
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
          Worker Comparison
        </h2>
        
        <div className="space-y-4">
          {activeWorkers.map((worker) => {
            const maxWinners = Math.max(...activeWorkers.map(w => w.myphonerStats?.winners || 0));
            const percentage = maxWinners > 0 
              ? ((worker.myphonerStats?.winners || 0) / maxWinners) * 100 
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
                      {worker.myphonerStats?.winners || 0}
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
      </div>
    </div>
  );
}


