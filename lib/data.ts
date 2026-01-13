import { Worker, DashboardStats } from './types';

// In-memory data store (in production, use a database)
// This will persist during the server session but reset on restart
// For production, connect to a database like PostgreSQL, MongoDB, or use Vercel KV

let workers: Worker[] = [
  {
    id: '1',
    name: 'Emma Hansen',
    email: 'emma@asoldi.com',
    phone: '+47 123 45 678',
    role: 'caller',
    status: 'active',
    startDate: '2025-11-01',
    checklist: {
      contractSent: true,
      contractSigned: true,
      oneWeekMeeting: true,
      twoWeekMeeting: true,
      monthlyReview: false,
      trainingCompleted: true,
      systemAccessGranted: true,
      welcomeEmailSent: true,
      bankDetailsReceived: true,
      taxFormReceived: true,
    },
    myphonerStats: {
      totalCalls: 245,
      successfulCalls: 89,
      meetingsBooked: 34,
      winners: 12,
      conversionRate: 14.3,
      lastCallDate: '2026-01-13',
    },
    paymentInfo: {
      hourlyRate: 180,
      commissionPerWinner: 500,
      totalOwed: 8500,
      nextPayday: '2026-01-25',
      paymentMethod: 'bank',
    },
    notes: [
      { id: 'n1', content: 'Excellent performer, consider for team lead position', createdAt: '2026-01-10', createdBy: 'admin' }
    ],
    createdAt: '2025-11-01',
    updatedAt: '2026-01-13',
  },
  {
    id: '2',
    name: 'Lars Olsen',
    email: 'lars@asoldi.com',
    phone: '+47 234 56 789',
    role: 'caller',
    status: 'active',
    startDate: '2025-12-01',
    checklist: {
      contractSent: true,
      contractSigned: true,
      oneWeekMeeting: true,
      twoWeekMeeting: false,
      monthlyReview: false,
      trainingCompleted: true,
      systemAccessGranted: true,
      welcomeEmailSent: true,
      bankDetailsReceived: true,
      taxFormReceived: false,
    },
    myphonerStats: {
      totalCalls: 156,
      successfulCalls: 52,
      meetingsBooked: 21,
      winners: 7,
      conversionRate: 13.5,
      lastCallDate: '2026-01-12',
    },
    paymentInfo: {
      hourlyRate: 170,
      commissionPerWinner: 500,
      totalOwed: 5200,
      nextPayday: '2026-01-25',
      paymentMethod: 'bank',
    },
    notes: [],
    createdAt: '2025-12-01',
    updatedAt: '2026-01-12',
  },
  {
    id: '3',
    name: 'Sofia Berg',
    email: 'sofia@asoldi.com',
    phone: '+47 345 67 890',
    role: 'caller',
    status: 'onboarding',
    startDate: '2026-01-08',
    checklist: {
      contractSent: true,
      contractSigned: true,
      oneWeekMeeting: false,
      twoWeekMeeting: false,
      monthlyReview: false,
      trainingCompleted: false,
      systemAccessGranted: true,
      welcomeEmailSent: true,
      bankDetailsReceived: false,
      taxFormReceived: false,
    },
    myphonerStats: {
      totalCalls: 23,
      successfulCalls: 8,
      meetingsBooked: 3,
      winners: 1,
      conversionRate: 12.5,
      lastCallDate: '2026-01-13',
    },
    paymentInfo: {
      hourlyRate: 160,
      commissionPerWinner: 500,
      totalOwed: 1100,
      nextPayday: '2026-01-25',
      paymentMethod: 'bank',
    },
    notes: [
      { id: 'n2', content: 'New hire - needs extra support during first weeks', createdAt: '2026-01-08', createdBy: 'admin' }
    ],
    createdAt: '2026-01-08',
    updatedAt: '2026-01-13',
  },
  {
    id: '4',
    name: 'Erik Nilsen',
    email: 'erik@asoldi.com',
    phone: '+47 456 78 901',
    role: 'caller',
    status: 'active',
    startDate: '2025-10-15',
    checklist: {
      contractSent: true,
      contractSigned: true,
      oneWeekMeeting: true,
      twoWeekMeeting: true,
      monthlyReview: true,
      trainingCompleted: true,
      systemAccessGranted: true,
      welcomeEmailSent: true,
      bankDetailsReceived: true,
      taxFormReceived: true,
    },
    myphonerStats: {
      totalCalls: 312,
      successfulCalls: 98,
      meetingsBooked: 42,
      winners: 15,
      conversionRate: 14.7,
      lastCallDate: '2026-01-13',
    },
    paymentInfo: {
      hourlyRate: 190,
      commissionPerWinner: 500,
      totalOwed: 11200,
      nextPayday: '2026-01-25',
      paymentMethod: 'bank',
    },
    notes: [],
    createdAt: '2025-10-15',
    updatedAt: '2026-01-13',
  },
  {
    id: '5',
    name: 'Mia Johansen',
    email: 'mia@asoldi.com',
    phone: '+47 567 89 012',
    role: 'caller',
    status: 'active',
    startDate: '2025-11-15',
    checklist: {
      contractSent: true,
      contractSigned: true,
      oneWeekMeeting: true,
      twoWeekMeeting: true,
      monthlyReview: false,
      trainingCompleted: true,
      systemAccessGranted: true,
      welcomeEmailSent: true,
      bankDetailsReceived: true,
      taxFormReceived: true,
    },
    myphonerStats: {
      totalCalls: 198,
      successfulCalls: 71,
      meetingsBooked: 28,
      winners: 9,
      conversionRate: 13.9,
      lastCallDate: '2026-01-11',
    },
    paymentInfo: {
      hourlyRate: 175,
      commissionPerWinner: 500,
      totalOwed: 6800,
      nextPayday: '2026-01-25',
      paymentMethod: 'bank',
    },
    notes: [],
    createdAt: '2025-11-15',
    updatedAt: '2026-01-11',
  },
  {
    id: '6',
    name: 'Oscar Andersen',
    email: 'oscar@asoldi.com',
    phone: '+47 678 90 123',
    role: 'caller',
    status: 'inactive',
    startDate: '2025-09-01',
    checklist: {
      contractSent: true,
      contractSigned: true,
      oneWeekMeeting: true,
      twoWeekMeeting: true,
      monthlyReview: true,
      trainingCompleted: true,
      systemAccessGranted: false,
      welcomeEmailSent: true,
      bankDetailsReceived: true,
      taxFormReceived: true,
    },
    myphonerStats: {
      totalCalls: 0,
      successfulCalls: 0,
      meetingsBooked: 0,
      winners: 0,
      conversionRate: 0,
      lastCallDate: '2025-12-20',
    },
    paymentInfo: {
      hourlyRate: 170,
      commissionPerWinner: 500,
      totalOwed: 0,
      lastPaymentDate: '2025-12-25',
      nextPayday: '2026-01-25',
      paymentMethod: 'bank',
    },
    notes: [
      { id: 'n3', content: 'On leave until February 2026', createdAt: '2025-12-18', createdBy: 'admin' }
    ],
    createdAt: '2025-09-01',
    updatedAt: '2025-12-20',
  },
];

// Data access functions
export function getWorkers(): Worker[] {
  return workers;
}

export function getWorkerById(id: string): Worker | undefined {
  return workers.find(w => w.id === id);
}

export function updateWorker(id: string, updates: Partial<Worker>): Worker | null {
  const index = workers.findIndex(w => w.id === id);
  if (index === -1) return null;
  
  workers[index] = {
    ...workers[index],
    ...updates,
    updatedAt: new Date().toISOString().split('T')[0],
  };
  
  return workers[index];
}

export function addWorker(worker: Omit<Worker, 'id' | 'createdAt' | 'updatedAt'>): Worker {
  const newWorker: Worker = {
    ...worker,
    id: Date.now().toString(),
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  
  workers.push(newWorker);
  return newWorker;
}

export function deleteWorker(id: string): boolean {
  const index = workers.findIndex(w => w.id === id);
  if (index === -1) return false;
  
  workers.splice(index, 1);
  return true;
}

export function getDashboardStats(): DashboardStats {
  const activeWorkers = workers.filter(w => w.status === 'active');
  const onboardingWorkers = workers.filter(w => w.status === 'onboarding');
  
  const totalMeetings = workers.reduce((sum, w) => sum + (w.myphonerStats?.meetingsBooked || 0), 0);
  const totalWinners = workers.reduce((sum, w) => sum + (w.myphonerStats?.winners || 0), 0);
  const totalOwed = workers.reduce((sum, w) => sum + (w.paymentInfo?.totalOwed || 0), 0);
  
  // Calculate days until next payday (25th of each month)
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let nextPayday = new Date(currentYear, currentMonth, 25);
  
  if (today > nextPayday) {
    nextPayday = new Date(currentYear, currentMonth + 1, 25);
  }
  
  const daysUntilPayday = Math.ceil((nextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    totalWorkers: workers.length,
    activeWorkers: activeWorkers.length,
    totalMeetingsThisMonth: totalMeetings,
    totalWinnersThisMonth: totalWinners,
    totalOwedThisMonth: totalOwed,
    daysUntilPayday,
    pendingOnboarding: onboardingWorkers.length,
  };
}

export function updateWorkerChecklist(
  workerId: string,
  checklistKey: keyof Worker['checklist'],
  value: boolean
): Worker | null {
  const worker = getWorkerById(workerId);
  if (!worker) return null;
  
  return updateWorker(workerId, {
    checklist: {
      ...worker.checklist,
      [checklistKey]: value,
    },
  });
}

export function addWorkerNote(workerId: string, content: string, createdBy: string): Worker | null {
  const worker = getWorkerById(workerId);
  if (!worker) return null;
  
  const newNote = {
    id: Date.now().toString(),
    content,
    createdAt: new Date().toISOString().split('T')[0],
    createdBy,
  };
  
  return updateWorker(workerId, {
    notes: [...worker.notes, newNote],
  });
}


