// Call History Tracker for Myphoner
// Tracks which agent called which lead, even if claimed_by is cleared later
// This is needed because "Leads Called" counts all leads contacted, not just currently claimed

import fs from 'fs';
import path from 'path';

const CALL_HISTORY_FILE_PATH = path.join(process.cwd(), '.builds', 'data', 'myphoner-call-history.json');

interface CallRecord {
  leadId: number;
  agentEmail: string;
  calledAt: string; // ISO timestamp
  state: string; // lead state at time of call
  source: 'webhook' | 'claimed_by' | 'manual';
}

let callHistory: CallRecord[] = [];

// Load call history from file
function loadCallHistory(): void {
  try {
    if (fs.existsSync(CALL_HISTORY_FILE_PATH)) {
      const fileContent = fs.readFileSync(CALL_HISTORY_FILE_PATH, 'utf8');
      callHistory = JSON.parse(fileContent);
      console.log(`Loaded ${callHistory.length} call records from history`);
    }
  } catch (error) {
    console.log('No existing call history file found');
  }
}

// Save call history to file
function saveCallHistory(): void {
  try {
    const dir = path.dirname(CALL_HISTORY_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CALL_HISTORY_FILE_PATH, JSON.stringify(callHistory, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save call history:', error);
  }
}

// Load on module init
loadCallHistory();

// Record a call (from webhook or when we see claimed_by on a non-new lead)
export function recordCall(leadId: number, agentEmail: string, state: string, source: 'webhook' | 'claimed_by' | 'manual' = 'manual'): void {
  // Check if we already have this call recorded
  const existing = callHistory.find(
    c => c.leadId === leadId && c.agentEmail.toLowerCase() === agentEmail.toLowerCase()
  );
  
  if (!existing) {
    callHistory.push({
      leadId,
      agentEmail: agentEmail.toLowerCase(),
      calledAt: new Date().toISOString(),
      state,
      source,
    });
    saveCallHistory();
    console.log(`📞 Recorded call: lead ${leadId} by ${agentEmail}`);
  }
}

// Get all calls for an agent in a date range
export function getCallsForAgent(
  agentEmail: string,
  fromDate?: string,
  toDate?: string
): CallRecord[] {
  return callHistory.filter(call => {
    if (call.agentEmail.toLowerCase() !== agentEmail.toLowerCase()) {
      return false;
    }
    
    if (fromDate || toDate) {
      const callDate = new Date(call.calledAt);
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (callDate < from) return false;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (callDate > to) return false;
      }
    }
    
    return true;
  });
}

// Get unique lead IDs called by an agent (for "Leads Called" count)
export function getUniqueLeadsCalled(
  agentEmail: string,
  fromDate?: string,
  toDate?: string
): number {
  const calls = getCallsForAgent(agentEmail, fromDate, toDate);
  const uniqueLeadIds = new Set(calls.map(c => c.leadId));
  return uniqueLeadIds.size;
}

// Build call history from leads (when we see claimed_by on non-new leads)
export function buildCallHistoryFromLeads(leads: any[]): void {
  console.log('🔍 Building call history from leads...');
  let recorded = 0;
  let skipped = 0;
  
  for (const lead of leads) {
    const claimedBy = lead.claimed_by;
    const state = lead.state || lead.status || '';
    
    // Only record if lead has been contacted (not "new") and has a claimed_by
    if (claimedBy && state && state.toLowerCase() !== 'new') {
      const agentEmail = typeof claimedBy === 'string' ? claimedBy : null;
      
      if (agentEmail) {
        // Use last_updated as the call time (when lead was last worked on)
        const callTime = lead.last_updated || lead.updated_at || lead.created_at;
        if (callTime) {
          // Update the call record with the actual time from the lead
          const existing = callHistory.find(
            c => c.leadId === lead.id && c.agentEmail.toLowerCase() === agentEmail.toLowerCase()
          );
          
          if (!existing) {
            callHistory.push({
              leadId: lead.id,
              agentEmail: agentEmail.toLowerCase(),
              calledAt: callTime,
              state,
              source: 'claimed_by',
            });
            recorded++;
          } else {
            // Update existing record with latest state/time
            existing.state = state;
            existing.calledAt = callTime;
          }
        } else {
          recordCall(lead.id, agentEmail, state, 'claimed_by');
          recorded++;
        }
      } else {
        skipped++;
      }
    }
  }
  
  if (recorded > 0 || skipped > 0) {
    saveCallHistory();
  }
  
  console.log(`✅ Recorded ${recorded} calls from leads${skipped > 0 ? `, skipped ${skipped} (no email)` : ''}`);
}

// Get all call history
export function getAllCallHistory(): CallRecord[] {
  return callHistory;
}

// Clear old call history (optional cleanup)
export function clearCallHistory(olderThanDays: number = 365): void {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  
  const before = callHistory.length;
  callHistory = callHistory.filter(call => new Date(call.calledAt) >= cutoff);
  const after = callHistory.length;
  
  if (before !== after) {
    saveCallHistory();
    console.log(`🧹 Cleared ${before - after} old call records`);
  }
}
