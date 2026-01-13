import { getWorkerById, getWorkers } from '@/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Trophy,
  CreditCard,
  Clock,
  CheckCircle2,
  Circle,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import WorkerChecklist from '@/components/WorkerChecklist';
import WorkerNotes from '@/components/WorkerNotes';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const workers = getWorkers();
  return workers.map((worker) => ({
    id: worker.id,
  }));
}

export default async function WorkerDetailPage({ params }: Props) {
  const { id } = await params;
  const worker = getWorkerById(id);

  if (!worker) {
    notFound();
  }

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

  const checklistLabels: Record<string, string> = {
    contractSent: 'Contract Sent',
    contractSigned: 'Contract Signed',
    oneWeekMeeting: '1 Week Check-in Meeting',
    twoWeekMeeting: '2 Week Check-in Meeting',
    monthlyReview: 'Monthly Review',
    trainingCompleted: 'Training Completed',
    systemAccessGranted: 'System Access Granted',
    welcomeEmailSent: 'Welcome Email Sent',
    bankDetailsReceived: 'Bank Details Received',
    taxFormReceived: 'Tax Form Received',
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        href="/dashboard/workers"
        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors animate-fade-in"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Workers
      </Link>

      {/* Header */}
      <div className="glass-card p-8 animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-asoldi-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-asoldi-500/25">
              {worker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold font-display text-white">
                  {worker.name}
                </h1>
                <span className={`badge ${getStatusBadge(worker.status)}`}>
                  {worker.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-dark-400">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {worker.email}
                </span>
                {worker.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {worker.phone}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Started {worker.startDate}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary">Edit</button>
            <button className="btn-primary">Message</button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Phone className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.totalCalls || 0}
          </p>
          <p className="text-sm text-dark-400">Total Calls</p>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '200ms' }}>
          <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.meetingsBooked || 0}
          </p>
          <p className="text-sm text-dark-400">Meetings Booked</p>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.winners || 0}
          </p>
          <p className="text-sm text-dark-400">Winners</p>
        </div>
        <div className="glass-card p-6 text-center animate-slide-up" style={{ animationDelay: '400ms' }}>
          <TrendingUp className="w-8 h-8 text-asoldi-400 mx-auto mb-3" />
          <p className="text-3xl font-bold text-white font-display">
            {worker.myphonerStats?.conversionRate || 0}%
          </p>
          <p className="text-sm text-dark-400">Conversion Rate</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checklist - Takes 2 columns */}
        <div className="lg:col-span-2">
          <WorkerChecklist
            workerId={worker.id}
            checklist={worker.checklist}
            labels={checklistLabels}
          />
        </div>

        {/* Payment Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold font-display text-white">
                Payment Info
              </h2>
            </div>
            
            {worker.paymentInfo ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-dark-800">
                  <span className="text-dark-400">Hourly Rate</span>
                  <span className="text-white font-medium">
                    {worker.paymentInfo.hourlyRate} kr/hr
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-dark-800">
                  <span className="text-dark-400">Commission/Winner</span>
                  <span className="text-white font-medium">
                    {worker.paymentInfo.commissionPerWinner} kr
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-dark-800">
                  <span className="text-dark-400">Next Payday</span>
                  <span className="text-white font-medium">
                    {worker.paymentInfo.nextPayday}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 bg-asoldi-500/10 rounded-xl px-4 -mx-4">
                  <span className="text-asoldi-400 font-medium">Total Owed</span>
                  <span className="text-2xl font-bold text-asoldi-400 font-display">
                    {worker.paymentInfo.totalOwed.toLocaleString()} kr
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-dark-400 text-center py-4">
                No payment info available
              </p>
            )}
          </div>

          {/* Last Activity */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold font-display text-white">
                Last Activity
              </h2>
            </div>
            <p className="text-dark-400">
              Last call: {worker.myphonerStats?.lastCallDate || 'N/A'}
            </p>
            <p className="text-dark-400 mt-2">
              Updated: {worker.updatedAt}
            </p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <WorkerNotes workerId={worker.id} notes={worker.notes} />
    </div>
  );
}


