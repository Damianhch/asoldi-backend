'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { WorkerChecklist as WorkerChecklistType } from '@/lib/types';

interface WorkerChecklistProps {
  workerId: string;
  checklist: WorkerChecklistType;
  labels: Record<string, string>;
}

export default function WorkerChecklist({
  workerId,
  checklist,
  labels,
}: WorkerChecklistProps) {
  const [items, setItems] = useState<Record<string, boolean>>(checklist as unknown as Record<string, boolean>);
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (key: string) => {
    setLoading(key);
    
    try {
      const res = await fetch(`/api/workers/${workerId}/checklist`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: !items[key] }),
      });

      if (res.ok) {
        setItems((prev) => ({ ...prev, [key]: !prev[key] }));
      }
    } catch (error) {
      console.error('Failed to update checklist:', error);
    } finally {
      setLoading(null);
    }
  };

  const completedCount = Object.values(items).filter(Boolean).length;
  const totalCount = Object.keys(items).length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold font-display text-white">
          Onboarding Checklist
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-dark-400">
            {completedCount}/{totalCount} completed
          </span>
          <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage === 100
                  ? 'bg-asoldi-500'
                  : percentage >= 50
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(items).map(([key, value]) => (
          <button
            key={key}
            onClick={() => handleToggle(key)}
            disabled={loading === key}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left ${
              value
                ? 'bg-asoldi-500/10 border-asoldi-500/30 text-white'
                : 'bg-dark-900/50 border-dark-700 text-dark-300 hover:border-dark-600 hover:bg-dark-800/50'
            }`}
          >
            {loading === key ? (
              <Loader2 className="w-5 h-5 animate-spin text-asoldi-400" />
            ) : value ? (
              <CheckCircle2 className="w-5 h-5 text-asoldi-400 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-dark-500 flex-shrink-0" />
            )}
            <span className="font-medium">{labels[key] || key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}


