import { Worker, DashboardStats, WorkerChecklist } from './types';

// In-memory data store - workers will be synced from WordPress
let workers: Worker[] = [];

// Default empty checklist (all unchecked)
export const DEFAULT_CHECKLIST: WorkerChecklist = {
  contractSent: false,
  contractSigned: false,
  oneWeekMeeting: false,
  twoWeekMeeting: false,
  monthlyReview: false,
  trainingCompleted: false,
  systemAccessGranted: false,
  welcomeEmailSent: false,
  bankDetailsReceived: false,
  taxFormReceived: false,
};

// Data access functions
export function getWorkers(): Worker[] {
  return workers;
}

export function setWorkers(newWorkers: Worker[]): void {
  workers = newWorkers;
}

export function getWorkerById(id: string): Worker | undefined {
  return workers.find(w => w.id === id);
}

export function getWorkerByEmail(email: string): Worker | undefined {
  return workers.find(w => w.email.toLowerCase() === email.toLowerCase());
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

export function addOrUpdateWorkerByEmail(workerData: {
  name: string;
  email: string;
  wordpressId?: number;
  role?: 'caller' | 'admin' | 'other';
}): Worker {
  const existing = getWorkerByEmail(workerData.email);
  
  if (existing) {
    // Update existing worker
    return updateWorker(existing.id, {
      name: workerData.name,
      wordpressId: workerData.wordpressId,
    }) as Worker;
  }
  
  // Create new worker with empty checklist
  return addWorker({
    name: workerData.name,
    email: workerData.email,
    wordpressId: workerData.wordpressId,
    role: workerData.role || 'caller',
    status: 'active',
    startDate: new Date().toISOString().split('T')[0],
    checklist: { ...DEFAULT_CHECKLIST },
    myphonerStats: {
      totalCalls: 0,
      meetingsBooked: 0,
      hoursCalled: 0,
      conversionRate: 0,
    },
    paymentInfo: {
      hourlyRate: 0,
      commissionPerMeeting: 0,
      totalOwed: 0,
      nextPayday: getNextPayday(),
      paymentMethod: 'bank',
    },
    notes: [],
  });
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
  const totalHours = workers.reduce((sum, w) => sum + (w.myphonerStats?.hoursCalled || 0), 0);
  const totalOwed = workers.reduce((sum, w) => sum + (w.paymentInfo?.totalOwed || 0), 0);
  
  const daysUntilPayday = calculateDaysUntilPayday();
  
  return {
    totalWorkers: workers.length,
    activeWorkers: activeWorkers.length,
    totalMeetingsThisMonth: totalMeetings,
    totalHoursThisMonth: totalHours,
    totalOwedThisMonth: totalOwed,
    daysUntilPayday,
    pendingOnboarding: onboardingWorkers.length,
  };
}

export function updateWorkerChecklist(
  workerId: string,
  checklistKey: keyof WorkerChecklist,
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

export function updateWorkerMyphonerStats(
  workerId: string,
  stats: {
    totalCalls: number;
    meetingsBooked: number;
    hoursCalled: number;
    conversionRate: number;
  }
): Worker | null {
  return updateWorker(workerId, {
    myphonerStats: {
      ...stats,
      lastSyncDate: new Date().toISOString().split('T')[0],
    },
  });
}

// Helper functions
function getNextPayday(): string {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let nextPayday = new Date(currentYear, currentMonth, 25);
  
  if (today > nextPayday) {
    nextPayday = new Date(currentYear, currentMonth + 1, 25);
  }
  
  return nextPayday.toISOString().split('T')[0];
}

function calculateDaysUntilPayday(): number {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  let nextPayday = new Date(currentYear, currentMonth, 25);
  
  if (today > nextPayday) {
    nextPayday = new Date(currentYear, currentMonth + 1, 25);
  }
  
  return Math.ceil((nextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Clear all workers (for re-sync)
export function clearWorkers(): void {
  workers = [];
}
