import { Worker, DashboardStats, WorkerChecklist } from './types';
import fs from 'fs';
import path from 'path';

// File-based persistence for workers data
const DATA_FILE_PATH = path.join(process.cwd(), '.builds', 'data', 'workers.json');

// In-memory data store - workers will be synced from WordPress
let workers: Worker[] = [];

// Load workers from file on startup
function loadWorkersFromFile(): void {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      workers = JSON.parse(fileContent);
      console.log(`Loaded ${workers.length} workers from file: ${DATA_FILE_PATH}`);
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
}): Worker {
  const existing = getWorkerByEmail(workerData.email);
  
  if (existing) {
    // Update existing worker - PRESERVE all existing data (checklist, notes, stats, etc.)
    return updateWorker(existing.id, {
      name: workerData.name,
      wordpressId: workerData.wordpressId || existing.wordpressId,
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
  saveWorkersToFile();
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
  stats: {
    totalCalls: number;
    meetingsBooked: number;
    hoursCalled: number;
    conversionRate: number;
  }
): Worker | null {
  const result = updateWorker(workerId, {
    myphonerStats: {
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
