// MyPhoner API Integration
// API Documentation: https://www.myphoner.com/api/

const MYPHONER_API_KEY = process.env.MYPHONER_API_KEY;
const MYPHONER_BASE_URL = 'https://www.myphoner.com/api/v1';

interface MyphonerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface MyphonerAgent {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface MyphonerLead {
  id: number;
  name: string;
  phone: string;
  email?: string;
  status: string;
  outcome?: string;
  agent_id?: number;
  created_at: string;
  updated_at: string;
}

interface MyphonerCall {
  id: number;
  lead_id: number;
  agent_id: number;
  outcome: string;
  duration: number;
  notes?: string;
  created_at: string;
}

interface MyphonerStats {
  agent_id: number;
  total_calls: number;
  successful_calls: number;
  meetings_booked: number;
  winners: number;
}

// Helper function for API requests
async function myphonerFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<MyphonerResponse<T>> {
  if (!MYPHONER_API_KEY) {
    return { success: false, error: 'MyPhoner API key not configured' };
  }

  try {
    const response = await fetch(`${MYPHONER_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${MYPHONER_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('MyPhoner API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get all agents (your callers)
export async function getAgents(): Promise<MyphonerResponse<MyphonerAgent[]>> {
  return myphonerFetch<MyphonerAgent[]>('/agents');
}

// Get agent by ID
export async function getAgentById(id: number): Promise<MyphonerResponse<MyphonerAgent>> {
  return myphonerFetch<MyphonerAgent>(`/agents/${id}`);
}

// Get leads for a campaign
export async function getLeads(
  campaignId?: string,
  filters?: {
    status?: string;
    agent_id?: number;
    from_date?: string;
    to_date?: string;
  }
): Promise<MyphonerResponse<MyphonerLead[]>> {
  const params = new URLSearchParams();
  
  if (campaignId) params.append('campaign_id', campaignId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);

  const queryString = params.toString();
  const endpoint = queryString ? `/leads?${queryString}` : '/leads';
  
  return myphonerFetch<MyphonerLead[]>(endpoint);
}

// Get calls/activities
export async function getCalls(
  filters?: {
    agent_id?: number;
    from_date?: string;
    to_date?: string;
    outcome?: string;
  }
): Promise<MyphonerResponse<MyphonerCall[]>> {
  const params = new URLSearchParams();
  
  if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);
  if (filters?.outcome) params.append('outcome', filters.outcome);

  const queryString = params.toString();
  const endpoint = queryString ? `/calls?${queryString}` : '/calls';
  
  return myphonerFetch<MyphonerCall[]>(endpoint);
}

// Get stats for an agent
export async function getAgentStats(
  agentId: number,
  fromDate?: string,
  toDate?: string
): Promise<MyphonerResponse<MyphonerStats>> {
  const params = new URLSearchParams();
  params.append('agent_id', agentId.toString());
  if (fromDate) params.append('from_date', fromDate);
  if (toDate) params.append('to_date', toDate);

  return myphonerFetch<MyphonerStats>(`/stats?${params.toString()}`);
}

// Calculate stats from calls data
export function calculateStatsFromCalls(calls: MyphonerCall[]): {
  totalCalls: number;
  successfulCalls: number;
  meetingsBooked: number;
  winners: number;
  conversionRate: number;
} {
  const totalCalls = calls.length;
  
  // Adjust these outcome values based on your MyPhoner configuration
  const successfulCalls = calls.filter(c => 
    ['connected', 'interested', 'callback', 'meeting', 'sale'].includes(c.outcome.toLowerCase())
  ).length;
  
  const meetingsBooked = calls.filter(c => 
    c.outcome.toLowerCase() === 'meeting' || c.outcome.toLowerCase() === 'appointment'
  ).length;
  
  const winners = calls.filter(c => 
    c.outcome.toLowerCase() === 'sale' || c.outcome.toLowerCase() === 'won' || c.outcome.toLowerCase() === 'winner'
  ).length;

  const conversionRate = totalCalls > 0 
    ? Number(((winners / totalCalls) * 100).toFixed(1))
    : 0;

  return {
    totalCalls,
    successfulCalls,
    meetingsBooked,
    winners,
    conversionRate,
  };
}

// Sync worker stats with MyPhoner data
export async function syncWorkerWithMyphoner(
  agentEmail: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  totalCalls: number;
  successfulCalls: number;
  meetingsBooked: number;
  winners: number;
  conversionRate: number;
} | null> {
  // First, find the agent by email
  const agentsResponse = await getAgents();
  
  if (!agentsResponse.success || !agentsResponse.data) {
    console.error('Failed to fetch agents:', agentsResponse.error);
    return null;
  }

  const agent = agentsResponse.data.find(a => 
    a.email.toLowerCase() === agentEmail.toLowerCase()
  );

  if (!agent) {
    console.error('Agent not found for email:', agentEmail);
    return null;
  }

  // Get calls for this agent
  const callsResponse = await getCalls({
    agent_id: agent.id,
    from_date: fromDate,
    to_date: toDate,
  });

  if (!callsResponse.success || !callsResponse.data) {
    console.error('Failed to fetch calls:', callsResponse.error);
    return null;
  }

  return calculateStatsFromCalls(callsResponse.data);
}

// Test API connection
export async function testConnection(): Promise<boolean> {
  const response = await getAgents();
  return response.success;
}


