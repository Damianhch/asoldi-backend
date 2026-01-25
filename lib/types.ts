// Worker/Employee types
export interface Worker {
  id: string;
  name: string;
  email: string;
  role: 'caller' | 'admin' | 'other';
  status: 'active' | 'inactive' | 'onboarding';
  startDate: string;
  avatarUrl?: string;
  contractUrl?: string; // PDF contract file path
  wordpressId?: number; // WordPress user ID
  wordpressCreatedAt?: string; // WordPress user creation date
  
  // Checklist items
  checklist: WorkerChecklist;
  
  // MyPhoner stats
  myphonerStats?: MyphonerStats;
  
  // Payment info
  paymentInfo?: PaymentInfo;
  
  // Notes
  notes: Note[];
  
  createdAt: string;
  updatedAt: string;
}

export interface WorkerChecklist {
  contractSent: boolean;
  contractSigned: boolean;
  oneWeekMeeting: boolean;
  monthlyReview: boolean;
  systemAccessGranted: boolean;
  personalDetailsReceived: boolean;
}

export interface MyphonerStats {
  meetingsBooked: number; // Winners/meetings booked
  lastSyncDate?: string;
}

export interface PaymentInfo {
  hourlyRate?: number;
  commissionPerMeeting?: number;
  totalOwed: number;
  lastPaymentDate?: string;
  nextPayday: string;
  paymentMethod: 'bank' | 'other';
  bankAccount?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

// Dashboard stats
export interface DashboardStats {
  totalWorkers: number;
  activeWorkers: number;
  totalMeetingsThisMonth: number;
  totalHoursThisMonth: number;
  totalOwedThisMonth: number;
  daysUntilPayday: number;
  isOverdue: boolean;
  pendingOnboarding: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth types
export interface User {
  username: string;
  role: 'admin' | 'viewer';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Time interval options - matching Myphoner's actual options
export type TimeInterval = 'week' | 'month' | '3mth' | 'year' | 'thisyear';

// Time intervals - matching Myphoner's review page options
export const TIME_INTERVALS: { value: TimeInterval; label: string }[] = [
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: '1 mth' },
  { value: '3mth', label: '3 mth' },
  { value: 'year', label: '1 yrs' },
  { value: 'thisyear', label: 'This Year' },
];
