// Worker/Employee types
export interface Worker {
  id: string;
  name: string;
  email: string;
  role: 'caller' | 'admin' | 'other';
  status: 'active' | 'inactive' | 'onboarding';
  startDate: string;
  avatarUrl?: string;
  wordpressId?: number; // WordPress user ID
  
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
  twoWeekMeeting: boolean;
  monthlyReview: boolean;
  trainingCompleted: boolean;
  systemAccessGranted: boolean;
  welcomeEmailSent: boolean;
  bankDetailsReceived: boolean;
  taxFormReceived: boolean;
}

export interface MyphonerStats {
  totalCalls: number;
  meetingsBooked: number;
  hoursCalled: number; // Hours called instead of winners
  conversionRate: number; // Calls to meetings conversion
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

// Time interval options
export type TimeInterval = 'week' | 'month' | '2months' | '4months' | '6months' | 'year';

export const TIME_INTERVALS: { value: TimeInterval; label: string }[] = [
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: '2months', label: 'Last 2 Months' },
  { value: '4months', label: 'Last 4 Months' },
  { value: '6months', label: 'Last 6 Months' },
  { value: 'year', label: 'Last Year' },
];
