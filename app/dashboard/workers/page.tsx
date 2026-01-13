import { getWorkers } from '@/lib/data';
import { WorkerChecklist } from '@/lib/types';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Phone,
  Trophy,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function WorkersPage() {
  const workers = getWorkers();

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
        <Link href="/dashboard/workers/new" className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" />
          Add Worker
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="glass-card p-4 animate-slide-up">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
            <input
              type="text"
              placeholder="Search workers..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">All</button>
            <button className="btn-secondary text-sm opacity-60 hover:opacity-100">Active</button>
            <button className="btn-secondary text-sm opacity-60 hover:opacity-100">Onboarding</button>
            <button className="btn-secondary text-sm opacity-60 hover:opacity-100">Inactive</button>
          </div>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workers.map((worker, index) => {
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                  <Phone className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">
                    {worker.myphonerStats?.meetingsBooked || 0}
                  </p>
                  <p className="text-xs text-dark-500">Meetings</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                  <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">
                    {worker.myphonerStats?.winners || 0}
                  </p>
                  <p className="text-xs text-dark-500">Winners</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-dark-900/50 border border-dark-800">
                  <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">
                    {worker.myphonerStats?.conversionRate || 0}%
                  </p>
                  <p className="text-xs text-dark-500">Conversion</p>
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

              {/* Payment Info */}
              {worker.paymentInfo && (
                <div className="mt-4 pt-4 border-t border-dark-800 flex items-center justify-between">
                  <span className="text-sm text-dark-400">Amount Owed</span>
                  <span className="text-lg font-bold text-asoldi-400">
                    {worker.paymentInfo.totalOwed.toLocaleString()} kr
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}


