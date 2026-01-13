import { getDashboardStats, getWorkers } from '@/lib/data';
import {
  UserPlus,
  Phone,
  CreditCard,
  TrendingUp,
  Clock,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

export default function DashboardPage() {
  const stats = getDashboardStats();
  const workers = getWorkers();
  
  // Get workers needing attention (incomplete checklists)
  const workersNeedingAttention = workers.filter(w => {
    const checklist = w.checklist;
    const incompleteItems = (Object.values(checklist) as boolean[]).filter(v => !v).length;
    return incompleteItems > 3 && w.status !== 'inactive';
  });

  // Recent activity (simulated)
  const recentActivity = [
    { id: 1, action: 'New meeting booked', worker: 'Emma Hansen', time: '2 hours ago' },
    { id: 2, action: 'Winner recorded', worker: 'Erik Nilsen', time: '4 hours ago' },
    { id: 3, action: 'Contract signed', worker: 'Sofia Berg', time: '1 day ago' },
    { id: 4, action: 'Training completed', worker: 'Lars Olsen', time: '2 days ago' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold font-display text-white mb-2">
          Dashboard
        </h1>
        <p className="text-dark-400">
          Welcome back! Here&apos;s what&apos;s happening with your team.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Workers"
          value={stats.activeWorkers}
          subtitle={`${stats.totalWorkers} total`}
          iconName="users"
          color="green"
          delay={0}
        />
        <StatCard
          title="Meetings Booked"
          value={stats.totalMeetingsThisMonth}
          subtitle="This month"
          iconName="phone"
          color="blue"
          delay={100}
        />
        <StatCard
          title="Winners"
          value={stats.totalWinnersThisMonth}
          subtitle="This month"
          iconName="trophy"
          color="amber"
          delay={200}
        />
        <StatCard
          title="Total Owed"
          value={`${stats.totalOwedThisMonth.toLocaleString()} kr`}
          subtitle="This period"
          iconName="credit-card"
          color="purple"
          delay={300}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Days Until Payday"
          value={stats.daysUntilPayday}
          subtitle="25th of the month"
          iconName="calendar"
          color="green"
          delay={400}
        />
        <StatCard
          title="Pending Onboarding"
          value={stats.pendingOnboarding}
          subtitle="Workers in training"
          iconName="user-plus"
          color="amber"
          delay={500}
        />
        <StatCard
          title="Avg. Conversion Rate"
          value="13.9%"
          subtitle="Team average"
          iconName="trending-up"
          color="blue"
          delay={600}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workers Needing Attention */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
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
              All workers are up to date! 🎉
            </p>
          ) : (
            <div className="space-y-4">
              {workersNeedingAttention.map((worker) => {
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

        {/* Recent Activity */}
        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold font-display text-white">
              Recent Activity
            </h2>
            <Clock className="w-5 h-5 text-dark-500" />
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/50 border border-dark-800"
                style={{ animationDelay: `${900 + index * 100}ms` }}
              >
                <div className="w-2 h-2 rounded-full bg-asoldi-500" />
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-sm text-dark-400">{activity.worker}</p>
                </div>
                <span className="text-sm text-dark-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '1000ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/workers/new"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-asoldi-500/50 transition-all group"
          >
            <UserPlus className="w-8 h-8 text-dark-400 group-hover:text-asoldi-400 transition-colors" />
            <span className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
              Add Worker
            </span>
          </Link>
          <Link
            href="/dashboard/myphoner"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-blue-500/50 transition-all group"
          >
            <Phone className="w-8 h-8 text-dark-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
              Sync MyPhoner
            </span>
          </Link>
          <Link
            href="/dashboard/payments"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-purple-500/50 transition-all group"
          >
            <CreditCard className="w-8 h-8 text-dark-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
              View Payments
            </span>
          </Link>
          <Link
            href="/dashboard/reports"
            className="flex flex-col items-center gap-3 p-6 rounded-xl bg-dark-900/50 hover:bg-dark-800/50 border border-dark-700 hover:border-amber-500/50 transition-all group"
          >
            <TrendingUp className="w-8 h-8 text-dark-400 group-hover:text-amber-400 transition-colors" />
            <span className="text-sm font-medium text-dark-300 group-hover:text-white transition-colors">
              View Reports
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
