import { Worker, DashboardStats, WorkerChecklist, MyphonerStats } from './types';
import fs from 'fs';
import path from 'path';

// File-based persistence for workers data
const DATA_FILE_PATH = path.join(process.cwd(), '.builds', 'data', 'workers.json');

// In-memory data store - workers will be synced from WordPress
let workers: Worker[] = [];

// Migrate old checklist structure to new structure
function migrateChecklist(oldChecklist: any): WorkerChecklist {
  // If it's already in the new format, return as is
  if (oldChecklist.personalDetailsReceived !== undefined && 
      oldChecklist.twoWeekMeeting === undefined &&
      oldChecklist.trainingCompleted === undefined &&
      oldChecklist.welcomeEmailSent === undefined &&
      oldChecklist.bankDetailsReceived === undefined &&
      oldChecklist.taxFormReceived === undefined) {
    return oldChecklist as WorkerChecklist;
  }

  // Migrate from old format to new format
  return {
    contractSent: oldChecklist.contractSent ?? false,
    contractSigned: oldChecklist.contractSigned ?? false,
    oneWeekMeeting: oldChecklist.oneWeekMeeting ?? false,
    monthlyReview: oldChecklist.monthlyReview ?? false,
    systemAccessGranted: oldChecklist.systemAccessGranted ?? false,
    // Combine bankDetailsReceived and taxFormReceived into personalDetailsReceived
    personalDetailsReceived: (oldChecklist.bankDetailsReceived ?? false) || (oldChecklist.taxFormReceived ?? false) || (oldChecklist.personalDetailsReceived ?? false),
  };
}

// Load workers from file on startup
function loadWorkersFromFile(): void {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      const loadedWorkers = JSON.parse(fileContent);
      
      // Migrate each worker's checklist
      workers = loadedWorkers.map((worker: any) => ({
        ...worker,
        checklist: migrateChecklist(worker.checklist || {}),
      }));
      
      // Save migrated data back to file
      saveWorkersToFile();
      
      console.log(`Loaded and migrated ${workers.length} workers from file: ${DATA_FILE_PATH}`);
    }
  } catch (error) {
    console.log('No existing workers file found, starting fresh');
  }
}

// Save workers to file
function saveWorkersToFile(): void {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(workers, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save workers to file:', error);
  }
}

// Load on module init
loadWorkersFromFile();

// Default empty checklist (all unchecked)
export const DEFAULT_CHECKLIST: WorkerChecklist = {
  contractSent: false,
  contractSigned: false,
  oneWeekMeeting: false,
  monthlyReview: false,
  systemAccessGranted: false,
  personalDetailsReceived: false,
};

// Data access functions
export function getWorkers(): Worker[] {
  return workers;
}

export function setWorkers(newWorkers: Worker[]): void {
  workers = newWorkers;
  saveWorkersToFile();
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
  
  saveWorkersToFile();
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
  saveWorkersToFile();
  return newWorker;
}

export function addOrUpdateWorkerByEmail(workerData: {
  name: string;
  email: string;
  wordpressId?: number;
  role?: 'caller' | 'admin' | 'other';
  wordpressCreatedAt?: string;
}): Worker {
  const existing = getWorkerByEmail(workerData.email);
  
  if (existing) {
    // Update existing worker - PRESERVE all existing data (checklist, notes, stats, etc.)
    return updateWorker(existing.id, {
      name: workerData.name,
      wordpressId: workerData.wordpressId || existing.wordpressId,
      wordpressCreatedAt: workerData.wordpressCreatedAt || existing.wordpressCreatedAt,
      startDate: workerData.wordpressCreatedAt || existing.startDate, // Use WordPress creation date as start date
      // Keep all existing data - don't overwrite checklist, notes, stats, paymentInfo, etc.
    }) as Worker;
  }
  
  // Create new worker with empty checklist
  return addWorker({
    name: workerData.name,
    email: workerData.email,
    wordpressId: workerData.wordpressId,
    role: workerData.role || 'caller',
    status: 'active',
    startDate: workerData.wordpressCreatedAt || new Date().toISOString().split('T')[0],
    wordpressCreatedAt: workerData.wordpressCreatedAt,
    checklist: { ...DEFAULT_CHECKLIST },
    myphonerStats: {
      meetingsBooked: 0,
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
  saveWorkersToFile();
  return true;
}

export function getDashboardStats(): DashboardStats {
  const activeWorkers = workers.filter(w => w.status === 'active');
  const onboardingWorkers = workers.filter(w => w.status === 'onboarding');
  
  const totalMeetings = workers.reduce((sum, w) => sum + (w.myphonerStats?.meetingsBooked || 0), 0);
  // Removed hoursCalled - not tracking this anymore
  const totalHours = 0; // Hours tracking disabled
  
  // Calculate total owed for current month for all workers
  const totalOwed = workers.reduce((sum, w) => {
    return sum + calculateTotalOwedForCurrentMonth(w);
  }, 0);
  
  const daysUntilPayday = calculateDaysUntilPayday();
  
  // Check if any worker is overdue (not paid for previous month)
  const isOverdue = workers.some(w => {
    if (!w.paymentInfo || w.status === 'inactive') return false;
    return isPaymentOverdue(w.paymentInfo.lastPaymentDate);
  });
  
  return {
    totalWorkers: workers.length,
    activeWorkers: activeWorkers.length,
    totalMeetingsThisMonth: totalMeetings,
    totalHoursThisMonth: totalHours,
    totalOwedThisMonth: totalOwed,
    daysUntilPayday,
    isOverdue,
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
  
  const result = updateWorker(workerId, {
    checklist: {
      ...worker.checklist,
      [checklistKey]: value,
    },
  });
  saveWorkersToFile();
  return result;
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
  
  const result = updateWorker(workerId, {
    notes: [...worker.notes, newNote],
  });
  saveWorkersToFile();
  return result;
}

export function updateWorkerMyphonerStats(
  workerId: string,
  stats: Partial<MyphonerStats> & { meetingsBooked: number }
): Worker | null {
  const worker = getWorkerById(workerId);
  if (!worker) return null;
  
  const result = updateWorker(workerId, {
    myphonerStats: {
      ...worker.myphonerStats,
      ...stats,
      lastSyncDate: new Date().toISOString().split('T')[0],
    },
  });
  saveWorkersToFile();
  return result;
}

// Helper functions
function getNextPayday(): string {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  // Payday is always the 1st of next month (for current month's earnings)
  const nextPayday = new Date(currentYear, currentMonth + 1, 1);
  
  return nextPayday.toISOString().split('T')[0];
}

function calculateDaysUntilPayday(): number {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  // Payday is always the 1st of next month
  const nextPayday = new Date(currentYear, currentMonth + 1, 1);
  
  return Math.ceil((nextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

// Check if payment is overdue (if we're past the 1st and lastPaymentDate is before the 1st of current month)
function isPaymentOverdue(lastPaymentDate?: string): boolean {
  if (!lastPaymentDate) {
    // If never paid, check if we're past the 1st of current month
    const today = new Date();
    return today.getDate() > 1;
  }
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const lastPayment = new Date(lastPaymentDate);
  
  // If we're past the 1st and last payment was before the 1st of current month, it's overdue
  return today.getDate() > 1 && lastPayment < firstOfCurrentMonth;
}

// Calculate total owed for current month (from 1st of month to today)
export function calculateTotalOwedForCurrentMonth(worker: Worker): number {
  if (!worker.paymentInfo || !worker.myphonerStats) {
    return 0;
  }
  
  const commissionPerMeeting = worker.paymentInfo.commissionPerMeeting || 0;
  const meetingsBooked = worker.myphonerStats.meetingsBooked || 0;
  
  // Calculate based on current month's stats
  // Note: This assumes myphonerStats.meetingsBooked is for current month period
  // If it's not, you'll need to sync with 'month' interval specifically for payment calculation
  const meetingsPayment = meetingsBooked * commissionPerMeeting;
  
  return meetingsPayment;
}

// Clear all workers (for re-sync)
export function clearWorkers(): void {
  workers = [];
}
