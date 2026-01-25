// User ID to Email Mapping for Myphoner
// Since Myphoner API doesn't provide user lookup, we build this mapping from:
// 1. Webhook data (new_call events include user_email)
// 2. Lead analysis (if claimed_by is email, we can map it)
// 3. Manual mapping stored in data file

import fs from 'fs';
import path from 'path';

const MAPPING_FILE_PATH = path.join(process.cwd(), '.builds', 'data', 'myphoner-user-mapping.json');

interface UserMapping {
  userId: number;
  email: string;
  name?: string;
  source: 'webhook' | 'lead' | 'manual';
  lastSeen: string;
}

let userMapping: Map<number, UserMapping> = new Map();

// Load mapping from file
function loadMapping(): void {
  try {
    if (fs.existsSync(MAPPING_FILE_PATH)) {
      const fileContent = fs.readFileSync(MAPPING_FILE_PATH, 'utf8');
      const data = JSON.parse(fileContent);
      userMapping = new Map(data.map((item: UserMapping) => [item.userId, item]));
      console.log(`Loaded ${userMapping.size} user mappings from file`);
    }
  } catch (error) {
    console.log('No existing user mapping file found');
  }
}

// Save mapping to file
function saveMapping(): void {
  try {
    const dir = path.dirname(MAPPING_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = Array.from(userMapping.values());
    fs.writeFileSync(MAPPING_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save user mapping:', error);
  }
}

// Load on module init
loadMapping();

// Add or update user mapping
export function addUserMapping(userId: number, email: string, name?: string, source: 'webhook' | 'lead' | 'manual' = 'manual'): void {
  const existing = userMapping.get(userId);
  if (!existing || existing.source === 'manual' || source === 'webhook') {
    userMapping.set(userId, {
      userId,
      email: email.toLowerCase(),
      name,
      source,
      lastSeen: new Date().toISOString(),
    });
    saveMapping();
    console.log(`✅ Mapped user ID ${userId} → ${email}`);
  }
}

// Get email by user ID
export function getEmailByUserId(userId: number): string | null {
  const mapping = userMapping.get(userId);
  return mapping ? mapping.email : null;
}

// Get user ID by email (reverse lookup)
export function getUserIdByEmail(email: string): number | null {
  for (const [userId, mapping] of userMapping.entries()) {
    if (mapping.email.toLowerCase() === email.toLowerCase()) {
      return userId;
    }
  }
  return null;
}

// Build mapping from leads (if claimed_by is email, we can infer user IDs)
export async function buildMappingFromLeads(leads: any[]): Promise<void> {
  console.log('🔍 Building user mapping from leads...');
  let mapped = 0;
  
  for (const lead of leads) {
    const claimedBy = lead.claimed_by;
    if (!claimedBy) continue;
    
    // If claimed_by is an email string, we can't map it to a user ID
    // But if it's a number and we see patterns, we can try
    // Actually, we need webhooks or manual mapping for this
    
    // For now, we'll rely on webhooks to build the mapping
  }
  
  console.log(`✅ Built ${mapped} mappings from leads`);
}

// Get all mappings
export function getAllMappings(): UserMapping[] {
  return Array.from(userMapping.values());
}
