// MyPhoner API Integration
// API Documentation: https://www.myphoner.com/docs/api/

// Load .env file if variables not in process.env (for local dev)
function loadMyPhonerEnvIfNeeded() {
  if (!process.env.MYPHONER_API_KEY || !process.env.MYPHONER_SUBDOMAIN) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      // Try multiple locations
      const envPaths = [
        path.join(process.cwd(), '.env'),
        path.join(process.cwd(), '.env.local'),
      ];
      
      for (const envPath of envPaths) {
        if (fs.existsSync(envPath)) {
          console.log(`Loading MyPhoner env from: ${envPath}`);
          const envContent = fs.readFileSync(envPath, 'utf8');
          envContent.split(/\r?\n/).forEach((line: string) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
              const match = trimmed.match(/^([^=]+)=(.*)$/);
              if (match) {
                let key = match[1].trim();
                let value = match[2].trim();
                // Remove quotes
                value = value.replace(/^["']|["']$/g, '');
                value = value.replace(/^\\"|\\"$/g, '');
                value = value.trim();
                // Only set if not already set and is MyPhoner related
                if ((key === 'MYPHONER_API_KEY' || key === 'MYPHONER_SUBDOMAIN' || key === 'MYPHONER_CAMPAIGN_ID') && !process.env[key]) {
                  process.env[key] = value;
                }
              }
            }
          });
          break; // Stop after first file found
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }
}

// Load env on module init
loadMyPhonerEnvIfNeeded();

// Helper to clean env values (remove quotes)
function getEnvValue(key: string, defaultValue = ''): string {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  // Remove surrounding quotes if present
  let cleaned = value.trim();
  cleaned = cleaned.replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/^\\"|\\"$/g, '');
  cleaned = cleaned.replace(/^\\'|\\'$/g, '');
  
  return cleaned.trim();
}

// Get values - reload env each time to ensure fresh values
export function getMyPhonerConfig() {
  loadMyPhonerEnvIfNeeded();
  const apiKey = getEnvValue('MYPHONER_API_KEY');
  const subdomain = getEnvValue('MYPHONER_SUBDOMAIN');
  
  // Log what we found
  console.log('MyPhoner Config Check:', {
    rawSubdomain: process.env.MYPHONER_SUBDOMAIN,
    cleanedSubdomain: subdomain,
    hasApiKey: !!apiKey,
    allMyPhonerKeys: Object.keys(process.env).filter(k => k.includes('MYPHONER')).join(', '),
  });
  
  if (!subdomain) {
    console.error('⚠️ MYPHONER_SUBDOMAIN not found in .env! Using default "demo"');
    console.error('Please add MYPHONER_SUBDOMAIN=asoldi to your .env file');
  }
  
  return {
    apiKey: apiKey,
    subdomain: subdomain || 'demo', // Only use demo as fallback
  };
}

// Don't set these at module level - get them dynamically
// const config = getMyPhonerConfig();
// const MYPHONER_API_KEY = config.apiKey;
// const MYPHONER_SUBDOMAIN = config.subdomain;
// const MYPHONER_BASE_URL = `https://${MYPHONER_SUBDOMAIN}.myphoner.com/api/v2`;

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
  last_updated?: string;
  state?: string; // "new", "call_back", "won", "lost", "archived"
  claimed_by?: number | string | null; // User ID or email
  claimed_at?: string | null;
  category?: string | null;
  created_at: string;
  lead_data?: {
    first_name?: string;
    last_name?: string;
    mobile_phone?: string;
    e_mail?: string;
    [key: string]: any;
  };
  // Legacy fields for compatibility
  name?: string;
  phone?: string;
  email?: string;
  status?: string; // Alias for state
  outcome?: string; // Alias for category or state
  agent_id?: number;
  updated_at?: string; // Alias for last_updated
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

interface MyphonerEvent {
  id: number;
  lead_id: number;
  agent_id: number;
  outcome: string; // "winner", "loser", "call_back", etc.
  created_at: string;
}

interface MyphonerUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface MyphonerAgentStats {
  meetingsBooked: number; // Winners/meetings booked
}

// Helper function for API requests
export async function myphonerFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<MyphonerResponse<T>> {
  // Reload config to ensure fresh values EVERY TIME
  const currentConfig = getMyPhonerConfig();
  const apiKey = currentConfig.apiKey;
  const subdomain = currentConfig.subdomain;
  const baseUrl = `https://${subdomain}.myphoner.com/api/v2`;
  
  console.log('🔍 MyPhoner API Request:', {
    endpoint,
    baseUrl,
    subdomain,
    hasApiKey: !!apiKey,
  });
  
  if (!apiKey) {
    return { success: false, error: 'MyPhoner API key not configured' };
  }

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Token "${apiKey}"`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not read error');
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }
      
      console.error('MyPhoner API Error:', {
        url: `${baseUrl}${endpoint}`,
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        subdomain: subdomain,
        apiKeySet: !!apiKey,
      });
      
      return {
        success: false,
        error: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
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

// Get lists/campaigns first (required for most MyPhoner operations)
export async function getLists(): Promise<MyphonerResponse<any[]>> {
  console.log('🔍 Fetching lists/campaigns...');
  return myphonerFetch<any[]>('/lists');
}

// Helper function to get campaign IDs from environment variable
// Supports single ID or comma-separated list: "194268" or "194268,194269,194270"
export function getCampaignIds(): string[] {
  const campaignId = process.env.MYPHONER_CAMPAIGN_ID;
  if (!campaignId) return [];
  
  // Split by comma and trim whitespace
  return campaignId.split(',').map(id => id.trim()).filter(id => id.length > 0);
}

// Get all agents (your callers)
// MyPhoner API: Users are accessed through leads or we need to get them from a list
export async function getAgents(): Promise<MyphonerResponse<MyphonerAgent[]>> {
  const config = getMyPhonerConfig();
  console.log('🔍 Fetching agents with subdomain:', config.subdomain);
  
  // Strategy 1: Try to get users from leads (if we have list IDs)
  const campaignIds = getCampaignIds();
  if (campaignIds.length > 0) {
    console.log('📋 Using campaign IDs:', campaignIds.join(', '));
    const agentMap = new Map<string | number, MyphonerAgent>();
    
    // Get leads from all campaign IDs
    for (const campaignId of campaignIds) {
      const leadsResponse = await myphonerFetch<any[]>(`/lists/${campaignId}/leads?per_page=100`);
      if (leadsResponse.success && leadsResponse.data) {
        console.log(`📋 Checking ${leadsResponse.data.length} leads for agent info...`);
        // Extract unique agents from leads using claimed_by field
        leadsResponse.data.forEach((lead: any) => {
          const claimedBy = lead.claimed_by;
          if (!claimedBy) return;
          
          // claimed_by can be user ID (number) or email (string)
          let agentId: number;
          let agentEmail: string;
          
          if (typeof claimedBy === 'number') {
            agentId = claimedBy;
            agentEmail = `user_${claimedBy}@myphoner.local`; // Placeholder, we'll need to match by ID
          } else if (typeof claimedBy === 'string' && claimedBy.includes('@')) {
            // It's an email
            agentEmail = claimedBy;
            agentId = 0; // We'll match by email instead
          } else {
            return; // Skip invalid claimed_by
          }
          
          // Use claimed_by value directly as key (can be number or string)
          if (!agentMap.has(claimedBy)) {
            agentMap.set(claimedBy, {
              id: agentId || 0,
              name: agentEmail.split('@')[0] || `Agent ${claimedBy}`,
              email: agentEmail,
              phone: undefined,
            });
          }
        });
        console.log(`📊 Extracted ${agentMap.size} unique agents from leads`);
      } else {
        console.warn(`⚠️ Failed to get leads from list ${campaignId}:`, leadsResponse.error);
      }
    }
    
    const agents = Array.from(agentMap.values());
    if (agents.length > 0) {
      console.log(`✅ Found ${agents.length} agents from ${campaignIds.length} list(s)`);
      return { success: true, data: agents };
    }
  }
  
  // Strategy 2: Try /users endpoint (v2 API)
  console.log('🔍 Trying /users endpoint...');
  const usersResponse = await myphonerFetch<any[]>('/users');
  
  if (usersResponse.success && usersResponse.data) {
    console.log(`✅ Found ${usersResponse.data.length} users`);
    const agents: MyphonerAgent[] = (usersResponse.data || []).map((user: any) => ({
      id: user.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || `User ${user.id}`,
      email: user.email,
      phone: user.phone,
    }));
    return { success: true, data: agents };
  }
  
  // Strategy 3: Try /agents endpoint (fallback)
  console.log('⚠️ /users failed, trying /agents...');
  const agentsResponse = await myphonerFetch<MyphonerAgent[]>('/agents');
  
  if (agentsResponse.success && agentsResponse.data) {
    console.log(`✅ Found ${agentsResponse.data.length} agents`);
    return agentsResponse;
  }
  
  // Strategy 4: Get lists first, then try to get users from a list
  console.log('⚠️ /agents failed, trying to get lists first...');
  const listsResponse = await getLists();
  if (listsResponse.success && listsResponse.data && listsResponse.data.length > 0) {
    console.log(`✅ Found ${listsResponse.data.length} lists`);
    // Try to get leads from first list to extract agents
    const firstListId = listsResponse.data[0].id;
    console.log(`🔍 Trying to get agents from list ${firstListId}...`);
      const leadsResponse = await myphonerFetch<any[]>(`/lists/${firstListId}/leads?per_page=100`);
      if (leadsResponse.success && leadsResponse.data) {
        const agentMap = new Map<string | number, MyphonerAgent>();
        leadsResponse.data.forEach((lead: any) => {
          const claimedBy = lead.claimed_by;
          if (!claimedBy) return;
          
          let agentId: number;
          let agentEmail: string;
          
          if (typeof claimedBy === 'number') {
            agentId = claimedBy;
            agentEmail = `user_${claimedBy}@myphoner.local`;
          } else if (typeof claimedBy === 'string' && claimedBy.includes('@')) {
            agentEmail = claimedBy;
            agentId = 0;
          } else {
            return;
          }
          
          const key = claimedBy;
          if (!agentMap.has(key)) {
            agentMap.set(key, {
              id: agentId || 0,
              name: agentEmail.split('@')[0] || `Agent ${key}`,
              email: agentEmail,
              phone: undefined,
            });
          }
        });
      const agents = Array.from(agentMap.values());
      if (agents.length > 0) {
        console.log(`✅ Found ${agents.length} agents from list leads`);
        return { success: true, data: agents };
      }
    }
  }
  
  // All strategies failed
  console.error('❌ All strategies failed to get agents');
  return { success: false, error: 'Could not find agents. Try setting MYPHONER_CAMPAIGN_ID in .env' };
}

// Get agent by ID
export async function getAgentById(id: number): Promise<MyphonerResponse<MyphonerAgent>> {
  return myphonerFetch<MyphonerAgent>(`/agents/${id}`);
}

// Get leads for a campaign/list
// Supports single list ID or multiple (comma-separated) - aggregates results
export async function getLeads(
  listId?: string | number | string[],
  filters?: {
    status?: string;
    agent_id?: number;
    from_date?: string;
    to_date?: string;
  }
): Promise<MyphonerResponse<MyphonerLead[]>> {
  const config = getMyPhonerConfig();
  
  // Determine which list IDs to use
  let listIds: string[] = [];
  if (listId) {
    // If listId is provided, use it (could be single or array)
    listIds = Array.isArray(listId) ? listId : [String(listId)];
  } else {
    // Otherwise, get from environment variable (supports comma-separated)
    listIds = getCampaignIds();
  }
  
  // If we have list IDs, fetch from each and aggregate
  // NOTE: Myphoner API only supports per_page, page, order parameters
  // We must filter by agent_id and dates client-side
  if (listIds.length > 0) {
    const allLeads: MyphonerLead[] = [];
    const errors: string[] = [];
    
    for (const campaignId of listIds) {
      // API only supports: per_page, page, order
      // Use order=last_updated_first to get recently updated leads first (more likely to be claimed)
      const allLeadsForList: MyphonerLead[] = [];
      let page = 1;
      let hasMore = true;
      const maxPages = 10; // Limit to prevent infinite loops, adjust if needed
      
      while (hasMore && page <= maxPages) {
        const params = new URLSearchParams();
        params.append('per_page', '100'); // Get as many as possible per page
        params.append('page', String(page));
        params.append('order', 'last_updated_first'); // Get recently updated leads first
        // Note: agent_id, from_date, to_date are NOT supported by API - filter client-side
        
        const queryString = params.toString();
        const endpoint = `/lists/${campaignId}/leads${queryString ? `?${queryString}` : ''}`;
        console.log(`🔍 Fetching leads from list ${campaignId}, page ${page}:`, endpoint);
        
        const response = await myphonerFetch<any[]>(endpoint);
        if (response.success && response.data && response.data.length > 0) {
          allLeadsForList.push(...response.data);
          // If we got less than 100, we've reached the end
          hasMore = response.data.length === 100;
          page++;
          
          // If we have enough claimed leads, we can stop early
          const claimedCount = allLeadsForList.filter(l => l.claimed_by !== null && l.claimed_by !== undefined).length;
          if (claimedCount >= 50 && page > 2) {
            console.log(`✅ Found ${claimedCount} claimed leads, stopping pagination early`);
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log(`📊 Fetched ${allLeadsForList.length} total leads from list ${campaignId}`);
      const claimedCount = allLeadsForList.filter(l => l.claimed_by !== null && l.claimed_by !== undefined).length;
      console.log(`📊 ${claimedCount} of ${allLeadsForList.length} leads are claimed`);
      
      if (allLeadsForList.length > 0) {
        // Filter client-side by agent and date if needed
        let filteredLeads = allLeadsForList;
        
        // Filter by agent_id if provided (check claimed_by field)
        if (filters?.agent_id) {
          filteredLeads = filteredLeads.filter((lead: any) => {
            // claimed_by can be user ID (number) or email (string)
            const claimedBy = lead.claimed_by;
            if (!claimedBy) return false;
            
            // If claimed_by is a number, compare directly
            if (typeof claimedBy === 'number') {
              return claimedBy === filters.agent_id;
            }
            
            // If claimed_by is a string (email), we'd need to look up the user
            // For now, we'll need to get agents first and match by email
            // This is a limitation - we'll handle it in getAgentStatsByEmail
            return false; // Will be handled at higher level
          });
        }
        
        // Filter by date range if provided
        if (filters?.from_date || filters?.to_date) {
          filteredLeads = filteredLeads.filter((lead: any) => {
            const leadDate = lead.last_updated || lead.created_at;
            if (!leadDate) return false;
            
            const date = new Date(leadDate);
            if (filters.from_date) {
              const fromDate = new Date(filters.from_date);
              if (date < fromDate) return false;
            }
            if (filters.to_date) {
              const toDate = new Date(filters.to_date);
              toDate.setHours(23, 59, 59, 999); // End of day
              if (date > toDate) return false;
            }
            return true;
          });
        }
        
        allLeads.push(...filteredLeads);
      } else {
        errors.push(`List ${campaignId}: No leads found or failed to fetch`);
      }
    }
    
    if (allLeads.length > 0 || listIds.length === 1) {
      console.log(`✅ Aggregated ${allLeads.length} leads from ${listIds.length} list(s)`);
      if (errors.length > 0) {
        console.warn('⚠️ Some lists failed:', errors);
      }
      return { success: true, data: allLeads };
    }
    
    // All lists failed
    return { success: false, error: errors.join('; ') };
  }
  
  // Fallback: Try /leads endpoint (might not work without list ID)
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
  if (filters?.from_date) params.append('from_date', filters.from_date);
  if (filters?.to_date) params.append('to_date', filters.to_date);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/leads?${queryString}` : '/leads';
  console.log('⚠️ No list ID, trying generic /leads endpoint:', endpoint);
  return myphonerFetch<MyphonerLead[]>(endpoint);
}

// Get calls/activities
// NOTE: Myphoner API does NOT have /lists/{id}/calls or /calls endpoints
// We must calculate calls from leads data (leads that have been contacted)
// Call duration is NOT available via API unless we have call_ids from webhooks
export async function getCalls(
  filters?: {
    agent_id?: number;
    list_id?: number | string | string[];
    from_date?: string;
    to_date?: string;
    outcome?: string;
  }
): Promise<MyphonerResponse<MyphonerCall[]>> {
  // Myphoner API doesn't support listing calls
  // We need to get leads and treat contacted leads as "calls"
  // This is a workaround since the API only provides individual call lookup by ID
  
  const listIds: string[] = filters?.list_id 
    ? (Array.isArray(filters.list_id) ? filters.list_id.map(String) : [String(filters.list_id)])
    : getCampaignIds();
  
  if (listIds.length === 0) {
    return { success: false, error: 'No list IDs available' };
  }

  // Get leads - these represent contacts/calls
  const leadsResponse = await getLeads(listIds, {
    agent_id: filters?.agent_id,
    from_date: filters?.from_date,
    to_date: filters?.to_date,
  });

  if (!leadsResponse.success || !leadsResponse.data) {
    return { success: false, error: leadsResponse.error || 'Failed to fetch leads' };
  }

  // Filter leads that have been contacted (not in "new" state)
  // These represent calls/attempts
  const contactedLeads = leadsResponse.data.filter(lead => {
    const state = (lead.status || '').toLowerCase();
    return state !== 'new' && state !== ''; // Any lead that's been touched = a call
  });

  // Convert leads to "calls" format for compatibility
  const calls: MyphonerCall[] = contactedLeads.map(lead => ({
    id: lead.id,
    lead_id: lead.id,
    agent_id: lead.agent_id || 0,
    outcome: lead.outcome || lead.status || '',
    duration: 0, // Duration not available from leads - would need call_ids from webhooks
    created_at: lead.updated_at || lead.created_at,
  }));

  console.log(`✅ Calculated ${calls.length} calls from ${leadsResponse.data.length} leads`);
  return { success: true, data: calls };
}

// Get events (winners, losers, etc.) - MyPhoner API v2
// According to docs, events are accessed via leads or webhooks
// We'll get leads and then check their events/outcomes
export async function getEvents(
  filters?: {
    agent_id?: number;
    list_id?: number | string | string[]; // List/Campaign ID(s) - may be required
    from_date?: string;
    to_date?: string;
    outcome?: string; // "winner", "loser", etc.
  }
): Promise<MyphonerResponse<MyphonerEvent[]>> {
  const config = getMyPhonerConfig();
  
  // Determine which list IDs to use
  let listIds: string[] = [];
  if (filters?.list_id) {
    listIds = Array.isArray(filters.list_id) 
      ? filters.list_id.map(String)
      : [String(filters.list_id)];
  } else {
    listIds = getCampaignIds();
  }
  
  console.log('🔍 Getting events with filters:', { agent_id: filters?.agent_id, list_ids: listIds, outcome: filters?.outcome });
  
  // Strategy: Get leads and extract events from their outcomes
  // Winners are leads with outcome="winner"
  // getLeads now supports multiple list IDs and aggregates automatically
  const leadsResponse = await getLeads(listIds.length > 0 ? listIds : undefined, {
    agent_id: filters?.agent_id,
    from_date: filters?.from_date,
    to_date: filters?.to_date,
  });

  if (!leadsResponse.success || !leadsResponse.data) {
    console.error('❌ Failed to get leads for events:', leadsResponse.error);
    // Fallback: Try direct events endpoint
    const params = new URLSearchParams();
    if (filters?.agent_id) params.append('agent_id', filters.agent_id.toString());
    if (listIds.length > 0) {
      listIds.forEach(id => params.append('list_id[]', id));
    }
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.outcome) params.append('outcome', filters.outcome);
    const queryString = params.toString();
    const endpoint = queryString ? `/events?${queryString}` : '/events';
    console.log('⚠️ Trying direct events endpoint:', endpoint);
    return myphonerFetch<MyphonerEvent[]>(endpoint);
  }

  console.log(`✅ Found ${leadsResponse.data.length} leads, filtering for events...`);

  // Extract events from leads - leads have outcome field
  // Filter by outcome if specified (e.g., "winner")
  const events: MyphonerEvent[] = leadsResponse.data
    .filter(lead => {
      if (!filters?.outcome) return true;
      const leadOutcome = (lead.outcome || '').toLowerCase();
      const filterOutcome = filters.outcome.toLowerCase();
      return leadOutcome === filterOutcome;
    })
    .map(lead => ({
      id: lead.id,
      lead_id: lead.id,
      agent_id: lead.agent_id || 0,
      outcome: lead.outcome || '',
      created_at: lead.updated_at || lead.created_at, // Use updated_at as event time
    }));

  console.log(`✅ Found ${events.length} events with outcome "${filters?.outcome || 'any'}"`);
  return { success: true, data: events };
}

// Get individual lead details - might have more user info
export async function getLeadDetails(leadId: number): Promise<MyphonerResponse<any>> {
  return myphonerFetch<any>(`/leads/${leadId}`);
}

// Get user by email to find creation date
export async function getUserByEmail(email: string): Promise<MyphonerResponse<MyphonerUser>> {
  const usersResponse = await getAgents();
  if (!usersResponse.success || !usersResponse.data) {
    return { success: false, error: 'Failed to fetch users' };
  }

  const user = usersResponse.data.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Get full user details including created_at
  return myphonerFetch<MyphonerUser>(`/users/${user.id}`);
}

// Calculate stats from calls and events data - Only meetings booked (winners)
export function calculateStatsFromCallsAndEvents(
  calls: MyphonerCall[], 
  events: MyphonerEvent[] = []
): MyphonerAgentStats {
  // Count winners (meetings) - these are events with outcome="winner"
  const meetingsBooked = events.filter(e => {
    const outcome = (e.outcome || '').toLowerCase();
    return outcome === 'winner';
  }).length;

  return {
    meetingsBooked,
  };
}

// Legacy function for backward compatibility
export function calculateStatsFromCalls(calls: MyphonerCall[]): MyphonerAgentStats {
  return calculateStatsFromCallsAndEvents(calls, []);
}

// Get date range based on time interval - matching Myphoner's options
export function getDateRange(interval: string): { fromDate: string; toDate: string } {
  const now = new Date();
  const toDate = now.toISOString().split('T')[0];
  let fromDate: Date;

  switch (interval) {
    case 'week':
      // Last 7 days
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      // 1 mth - last 30 days
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3mth':
      // 3 mth - last ~90 days
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      // 1 yrs - last 365 days
      fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'thisyear':
      // This year - from Jan 1st of current year
      fromDate = new Date(now.getFullYear(), 0, 1);
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

  const campaignIds = getCampaignIds();
  console.log(`📅 Date range: ${fromDate} to ${toDate}, Campaign IDs: ${campaignIds.length > 0 ? campaignIds.join(', ') : 'NOT SET'}`);

  // Get leads - API doesn't support agent_id filter, filter client-side
  const leadsResponse = await getLeads(campaignIds.length > 0 ? campaignIds : undefined, {
    from_date: fromDate,
    to_date: toDate,
  });

  if (!leadsResponse.success || !leadsResponse.data) {
    console.error('❌ Failed to fetch leads:', leadsResponse.error);
    return null;
  }

  // Import user mapping
  const { getEmailByUserId } = await import('./myphoner-user-mapping');
  
  // Filter leads by agent email (match claimed_by with worker email)
  const agentLeads = leadsResponse.data.filter(lead => {
    const claimedBy = lead.claimed_by;
    if (!claimedBy) return false;
    
    // Match by email (string) - claimed_by can be email or user ID
    if (typeof claimedBy === 'string') {
      return claimedBy.toLowerCase() === agent.email.toLowerCase();
    }
    
    // If claimed_by is a number (user ID), try to get email from mapping
    if (typeof claimedBy === 'number') {
      const mappedEmail = getEmailByUserId(claimedBy);
      if (mappedEmail) {
        return mappedEmail.toLowerCase() === agent.email.toLowerCase();
      }
      return false;
    }
    
    return false;
  });
  
  console.log(`🔍 Filtered ${agentLeads.length} leads for agent ${email} (from ${leadsResponse.data.length} total)`);

  // Convert to calls - leads that have been contacted (not "new")
  const calls: MyphonerCall[] = agentLeads
    .filter(lead => {
      const state = (lead.state || lead.status || '').toLowerCase();
      return state !== 'new' && state !== '';
    })
    .map(lead => ({
      id: lead.id,
      lead_id: lead.id,
      agent_id: agent.id,
      outcome: lead.state || lead.status || lead.outcome || '',
      duration: 0,
      created_at: lead.last_updated || lead.updated_at || lead.created_at,
    }));

  // Get winners
  const winners = agentLeads.filter(lead => {
    const state = (lead.state || lead.status || '').toLowerCase();
    const category = (lead.category || lead.outcome || '').toLowerCase();
    return state === 'won' || category === 'winner';
  });

  const events: MyphonerEvent[] = winners.map(lead => ({
    id: lead.id,
    lead_id: lead.id,
    agent_id: agent.id,
    outcome: 'winner',
    created_at: lead.last_updated || lead.updated_at || lead.created_at,
  }));

  console.log(`✅ Found ${calls.length} calls and ${events.length} winners (meetings)`);

  return calculateStatsFromCallsAndEvents(calls, events);
}

// Build a mapping of user IDs to emails from leads
// This helps us match when claimed_by is a user ID (number) instead of email
async function buildUserIdToEmailMap(campaignIds: string[]): Promise<Map<number, string>> {
  const userIdToEmail = new Map<number, string>();
  
  // Get all leads to extract user ID -> email mappings
  // We'll look for patterns where we can infer the mapping
  // Note: This is a workaround since Myphoner API doesn't provide user lookup
  
  for (const campaignId of campaignIds) {
    const leadsResponse = await myphonerFetch<any[]>(`/lists/${campaignId}/leads?per_page=100`);
    if (leadsResponse.success && leadsResponse.data) {
      leadsResponse.data.forEach((lead: any) => {
        const claimedBy = lead.claimed_by;
        // If claimed_by is an email, we can't build a mapping
        // If it's a number, we'll need to try fetching individual lead details
        // For now, we'll rely on email matching primarily
      });
    }
  }
  
  return userIdToEmail;
}

// Get stats for a specific agent by email with time interval
export async function getAgentStatsByEmail(
  email: string,
  interval: string = 'month'
): Promise<{ agent: MyphonerAgent; stats: MyphonerAgentStats; createdAt?: string } | null> {
  // Create a dummy agent object - we'll match by email from leads
  const agent: MyphonerAgent = {
    id: 0, // Will be determined from leads
    name: email.split('@')[0],
    email: email.toLowerCase(),
  };

  const { fromDate, toDate } = getDateRange(interval);
  const campaignIds = getCampaignIds();
  
  console.log(`🔍 Getting stats for agent: ${email}, interval: ${interval}`);
  console.log(`📅 Date range: ${fromDate} to ${toDate}, Campaign IDs: ${campaignIds.length > 0 ? campaignIds.join(', ') : 'NOT SET'}`);

  // Import call history tracker
  const { buildCallHistoryFromLeads, getUniqueLeadsCalled, recordCall } = await import('./myphoner-call-history');
  
  // Get leads - API doesn't support agent_id filter, so we filter client-side
  // Don't filter by date in getLeads - we'll filter after matching by email
  // This ensures we get all leads that might have been worked on by the agent
  const leadsResponse = await getLeads(campaignIds.length > 0 ? campaignIds : undefined, {});
  
  // Build call history from leads (for leads with claimed_by set)
  // This will help us track leads that were called even if they're no longer claimed
  if (leadsResponse.success && leadsResponse.data) {
    buildCallHistoryFromLeads(leadsResponse.data);
    
    // Also try to find leads that were called but are no longer claimed
    // Look for leads with state != "new" that might have been called by this agent
    // We'll use a heuristic: if a lead has state != "new" and last_updated is recent,
    // and we have call history showing this agent called similar leads, we can infer
    // But for now, we'll rely on webhooks and claimed_by tracking
  }

  if (!leadsResponse.success || !leadsResponse.data) {
    console.error('❌ Failed to get leads:', leadsResponse.error);
    return null;
  }

  console.log(`📊 Total leads fetched: ${leadsResponse.data.length}`);
  
  // Debug: Check what claimed_by values look like
  const claimedBySamples = new Map<string, any[]>();
  const claimedByTypes = new Map<string, number>();
  leadsResponse.data.forEach((lead: any) => {
    const claimedBy = lead.claimed_by;
    if (claimedBy !== null && claimedBy !== undefined) {
      const type = typeof claimedBy;
      claimedByTypes.set(type, (claimedByTypes.get(type) || 0) + 1);
      
      // Store samples of each type
      if (!claimedBySamples.has(type)) {
        claimedBySamples.set(type, []);
      }
      const samples = claimedBySamples.get(type)!;
      if (samples.length < 3) {
        samples.push(claimedBy);
      }
    }
  });
  console.log(`📊 claimed_by types:`, Object.fromEntries(claimedByTypes));
  console.log(`📊 claimed_by samples:`, Object.fromEntries(Array.from(claimedBySamples.entries()).map(([k, v]) => [k, v])));

  // Filter leads by agent email (match claimed_by with worker email)
  // Also include leads from call history (even if claimed_by is now null)
  // Import user mapping functions
  const { getEmailByUserId, getUserIdByEmail } = await import('./myphoner-user-mapping');
  const { getCallsForAgent } = await import('./myphoner-call-history');
  
  // Get historical calls for this agent
  const historicalCalls = getCallsForAgent(agent.email, fromDate, toDate);
  const historicalLeadIds = new Set(historicalCalls.map(c => c.leadId));
  console.log(`📞 Found ${historicalLeadIds.size} leads in call history for ${agent.email}`);
  
  const agentLeads = leadsResponse.data.filter(lead => {
    const claimedBy = lead.claimed_by;
    
    // Include if in call history (even if claimed_by is now null)
    if (historicalLeadIds.has(lead.id)) {
      return true;
    }
    
    // Include if currently claimed by this agent
    if (!claimedBy) return false;
    
    // Match by email (string) - claimed_by can be email or user ID
    let emailMatches = false;
    if (typeof claimedBy === 'string') {
      emailMatches = claimedBy.toLowerCase() === agent.email.toLowerCase();
      if (emailMatches) {
        console.log(`✅ Matched lead ${lead.id} by email: ${claimedBy}`);
      }
    } else if (typeof claimedBy === 'number') {
      // If claimed_by is a number (user ID), try to get email from mapping
      const mappedEmail = getEmailByUserId(claimedBy);
      if (mappedEmail) {
        emailMatches = mappedEmail.toLowerCase() === agent.email.toLowerCase();
        if (emailMatches) {
          console.log(`✅ Matched lead ${lead.id} by user ID ${claimedBy} → ${mappedEmail}`);
        }
      } else {
        // No mapping found - log for debugging
        console.log(`⚠️ Lead ${lead.id} has claimed_by as number (${claimedBy}), no email mapping found`);
        return false;
      }
    }
    
    if (!emailMatches) return false;
    
    // Filter by date range - use last_updated (when lead was last worked on)
    const leadDate = lead.last_updated || lead.updated_at || lead.created_at;
    if (leadDate) {
      const date = new Date(leadDate);
      let inDateRange = true;
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0); // Start of day
        if (date < from) {
          inDateRange = false;
        }
      }
      if (toDate && inDateRange) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // End of day
        if (date > to) {
          inDateRange = false;
        }
      }
      
      if (!inDateRange) {
        // Log why lead was excluded (for debugging)
        if (emailMatches) {
          console.log(`⏰ Lead ${lead.id} excluded: date ${leadDate} outside range ${fromDate} to ${toDate}`);
        }
        return false;
      }
    } else {
      // No date info - exclude it
      return false;
    }
    
    return true;
  });

  // Log detailed stats
  const leadsByState = new Map<string, number>();
  agentLeads.forEach(lead => {
    const state = (lead.state || lead.status || 'unknown').toLowerCase();
    leadsByState.set(state, (leadsByState.get(state) || 0) + 1);
  });
  
  console.log(`✅ Found ${agentLeads.length} leads for agent ${agent.email} (from ${leadsResponse.data.length} total)`);
  console.log(`📊 Leads by state:`, Object.fromEntries(leadsByState));
  
  // Also check how many leads have claimed_by matching this email (for debugging)
  const totalMatchingEmail = leadsResponse.data.filter((lead: any) => {
    const claimedBy = lead.claimed_by;
    if (!claimedBy) return false;
    if (typeof claimedBy === 'string') {
      return claimedBy.toLowerCase() === agent.email.toLowerCase();
    }
    return false;
  }).length;
  console.log(`📊 Total leads with claimed_by=${agent.email}: ${totalMatchingEmail} (before date filter)`);

  if (agentLeads.length === 0) {
    console.warn(`⚠️ No leads found for ${agent.email}. This could mean:`);
    console.warn(`   1. claimed_by is a user ID (number) not email`);
    console.warn(`   2. No leads exist for this agent in the date range`);
    console.warn(`   3. Email mismatch between WordPress and Myphoner`);
    console.warn(`   4. All matching leads are outside the date range (${fromDate} to ${toDate})`);
    
    // Try to fetch a sample lead to see its full structure
    if (leadsResponse.data && leadsResponse.data.length > 0) {
      const sampleLeadId = leadsResponse.data[0].id;
      console.log(`🔍 Fetching individual lead ${sampleLeadId} to inspect structure...`);
      const leadDetailResponse = await myphonerFetch<any>(`/leads/${sampleLeadId}`);
      if (leadDetailResponse.success && leadDetailResponse.data) {
        console.log(`📋 Sample lead structure:`, {
          id: leadDetailResponse.data.id,
          claimed_by: leadDetailResponse.data.claimed_by,
          claimed_by_type: typeof leadDetailResponse.data.claimed_by,
          state: leadDetailResponse.data.state,
          category: leadDetailResponse.data.category,
          // Check if there's user info anywhere
          keys: Object.keys(leadDetailResponse.data),
        });
      }
    }
    
    return null;
  }

  // Get winners (meetings) - leads with state="won" or category="winner"
  // This is the only stat we track - winners/meetings booked
  const winners = agentLeads.filter(lead => {
    const state = (lead.state || lead.status || '').toLowerCase();
    const category = (lead.category || lead.outcome || '').toLowerCase();
    const isWinner = state === 'won' || category === 'winner';
    
    if (isWinner) {
      console.log(`🏆 Found winner: lead ${lead.id}, state="${state}", category="${category}", claimed_by="${lead.claimed_by}"`);
    }
    
    return isWinner;
  });

  // Convert to events format for compatibility
  const events: MyphonerEvent[] = winners.map(lead => ({
    id: lead.id,
    lead_id: lead.id,
    agent_id: agent.id,
    outcome: 'winner',
    created_at: lead.last_updated || lead.updated_at || lead.created_at,
  }));

  console.log(`✅ Found ${events.length} winners (meetings) for ${agent.email}`);

  // Try to get user creation date
  const userResponse = await getUserByEmail(email);
  const createdAt = userResponse.success && userResponse.data 
    ? userResponse.data.created_at.split('T')[0] 
    : undefined;

  // Calculate stats - only meetings booked (winners)
  const stats = calculateStatsFromCallsAndEvents([], events);
  console.log(`📊 Stats calculated: ${stats.meetingsBooked} meetings booked for ${agent.email}`);

  return {
    agent,
    stats,
    createdAt,
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
