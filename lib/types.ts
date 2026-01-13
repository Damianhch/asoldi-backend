// Worker/Employee types
export interface Worker {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'caller' | 'admin' | 'other';
  status: 'active' | 'inactive' | 'onboarding';
  startDate: string;
  avatarUrl?: string;
  
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
  successfulCalls: number;
  meetingsBooked: number;
  winners: number;
  conversionRate: number;
  lastCallDate?: string;
  campaignId?: string;
}

export interface PaymentInfo {
  hourlyRate?: number;
  commissionPerWinner?: number;
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
  totalWinnersThisMonth: number;
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

// MyPhoner API types
export interface MyphonerLead {
  id: string;
  name: string;
  phone: string;
  status: string;
  agent?: string;
  outcome?: string;
  createdAt: string;
}

export interface MyphonerAgent {
  id: string;
  name: string;
  email: string;
  stats: {
    calls: number;
    wins: number;
  };
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


