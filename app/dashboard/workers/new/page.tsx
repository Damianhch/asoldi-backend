'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Loader2 } from 'lucide-react';

export default function NewWorkerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'caller',
    hourlyRate: 160,
    commissionPerWinner: 500,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/workers/${data.worker.id}`);
      } else {
        setError(data.error || 'Failed to create worker');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard/workers"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors animate-fade-in"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Workers
      </Link>

      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold font-display text-white mb-2">
          Add New Worker
        </h1>
        <p className="text-dark-400">
          Add a new team member to start tracking their progress
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6 animate-slide-up">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              placeholder="+47 XXX XX XXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
            >
              <option value="caller">Caller</option>
              <option value="admin">Admin</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Hourly Rate (kr)
            </label>
            <input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
              className="input-field"
              min="0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Commission per Winner (kr)
            </label>
            <input
              type="number"
              value={formData.commissionPerWinner}
              onChange={(e) => setFormData({ ...formData, commissionPerWinner: Number(e.target.value) })}
              className="input-field"
              min="0"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link href="/dashboard/workers" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Add Worker
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


