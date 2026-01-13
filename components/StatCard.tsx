'use client';

import {
  Users,
  Phone,
  Trophy,
  CreditCard,
  Calendar,
  UserPlus,
  TrendingUp,
  Clock,
  BarChart3,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: 'users' | 'phone' | 'trophy' | 'credit-card' | 'calendar' | 'user-plus' | 'trending-up' | 'clock' | 'bar-chart';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'green' | 'blue' | 'amber' | 'purple' | 'red';
  delay?: number;
}

const colorClasses = {
  green: {
    bg: 'bg-asoldi-500/20',
    border: 'border-asoldi-500/30',
    text: 'text-asoldi-400',
    icon: 'text-asoldi-500',
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    icon: 'text-blue-500',
  },
  amber: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    icon: 'text-amber-500',
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    icon: 'text-purple-500',
  },
  red: {
    bg: 'bg-red-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    icon: 'text-red-500',
  },
};

const iconMap = {
  'users': Users,
  'phone': Phone,
  'trophy': Trophy,
  'credit-card': CreditCard,
  'calendar': Calendar,
  'user-plus': UserPlus,
  'trending-up': TrendingUp,
  'clock': Clock,
  'bar-chart': BarChart3,
};

export default function StatCard({
  title,
  value,
  subtitle,
  iconName,
  trend,
  color = 'green',
  delay = 0,
}: StatCardProps) {
  const colors = colorClasses[color];
  const Icon = iconMap[iconName];

  return (
    <div
      className="glass-card p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-dark-400 text-sm font-medium">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-display count-up">
              {value}
            </span>
            {trend && (
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-asoldi-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-dark-500 text-sm">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border}`}>
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  );
}
