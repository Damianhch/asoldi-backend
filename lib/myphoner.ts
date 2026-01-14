// MyPhoner API Integration
// API Documentation: https://www.myphoner.com/api/

const MYPHONER_API_KEY = process.env.MYPHONER_API_KEY;
const MYPHONER_BASE_URL = 'https://www.myphoner.com/api/v1';

interface MyphonerResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MyphonerAgent {
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

export interface MyphonerCall {
  id: number;
  lead_id: number;
  agent_id: number;
  outcome: string;
  duration: number; // Duration in seconds
  notes?: string;
  created_at: string;
}

export interface MyphonerAgentStats {
  totalCalls: number;
  meetingsBooked: number;
  hoursCalled: number; // Hours calculated from duration
  conversionRate: number; // Calls to meetings conversion
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

// Calculate stats from calls data - Updated for your requirements
export function calculateStatsFromCalls(calls: MyphonerCall[]): MyphonerAgentStats {
  const totalCalls = calls.length;
  
  // Calculate total duration in seconds, then convert to hours
  const totalDurationSeconds = calls.reduce((sum, call) => sum + (call.duration || 0), 0);
  const hoursCalled = Number((totalDurationSeconds / 3600).toFixed(1)); // Convert seconds to hours
  
  // Count meetings booked - adjust these outcome values based on your MyPhoner configuration
  const meetingsBooked = calls.filter(c => {
    const outcome = (c.outcome || '').toLowerCase();
    return outcome === 'meeting' || 
           outcome === 'appointment' || 
           outcome === 'booked' ||
           outcome === 'møte' || // Norwegian
           outcome === 'avtale'; // Norwegian
  }).length;
  
  // Conversion rate: calls to meetings (percentage)
  const conversionRate = totalCalls > 0 
    ? Number(((meetingsBooked / totalCalls) * 100).toFixed(1))
    : 0;

  return {
    totalCalls,
    meetingsBooked,
    hoursCalled,
    conversionRate,
  };
}

// Get date range based on time interval
export function getDateRange(interval: string): { fromDate: string; toDate: string } {
  const now = new Date();
  const toDate = now.toISOString().split('T')[0];
  let fromDate: Date;

  switch (interval) {
    case 'week':
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '2months':
      fromDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      break;
    case '4months':
      fromDate = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
      break;
    case '6months':
      fromDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to 1 month
  }

  return {
    fromDate: fromDate.toISOString().split('T')[0],
    toDate,
  };
}

// Sync worker stats with MyPhoner data - Updated
export async function syncWorkerWithMyphoner(
  agentEmail: string,
  interval: string = 'month'
): Promise<MyphonerAgentStats | null> {
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

  // Get date range
  const { fromDate, toDate } = getDateRange(interval);

  // Get calls for this agent within date range
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

// Get stats for a specific agent by email with time interval
export async function getAgentStatsByEmail(
  email: string,
  interval: string = 'month'
): Promise<{ agent: MyphonerAgent; stats: MyphonerAgentStats } | null> {
  const agentsResponse = await getAgents();
  
  if (!agentsResponse.success || !agentsResponse.data) {
    return null;
  }

  const agent = agentsResponse.data.find(a => 
    a.email.toLowerCase() === email.toLowerCase()
  );

  if (!agent) {
    return null;
  }

  const { fromDate, toDate } = getDateRange(interval);

  const callsResponse = await getCalls({
    agent_id: agent.id,
    from_date: fromDate,
    to_date: toDate,
  });

  if (!callsResponse.success || !callsResponse.data) {
    return null;
  }

  return {
    agent,
    stats: calculateStatsFromCalls(callsResponse.data),
  };
}

// Get all agents with their stats
export async function getAllAgentsWithStats(
  interval: string = 'month'
): Promise<Array<{ agent: MyphonerAgent; stats: MyphonerAgentStats }>> {
  const agentsResponse = await getAgents();
  
  if (!agentsResponse.success || !agentsResponse.data) {
    return [];
  }

  const { fromDate, toDate } = getDateRange(interval);
  const results: Array<{ agent: MyphonerAgent; stats: MyphonerAgentStats }> = [];

  for (const agent of agentsResponse.data) {
    const callsResponse = await getCalls({
      agent_id: agent.id,
      from_date: fromDate,
      to_date: toDate,
    });

    if (callsResponse.success && callsResponse.data) {
      results.push({
        agent,
        stats: calculateStatsFromCalls(callsResponse.data),
      });
    }
  }

  return results;
}

// Test API connection
export async function testConnection(): Promise<boolean> {
  const response = await getAgents();
  return response.success;
}
