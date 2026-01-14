import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export interface TokenPayload {
  username: string;
  role: 'admin' | 'viewer';
  iat: number;
  exp: number;
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  // Simple credential check - in production you might want to hash the stored password
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return true;
  }
  return false;
}

export function generateToken(username: string): string {
  return jwt.sign(
    { username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAuthFromCookies(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

export function isAuthenticated(token: string | undefined): boolean {
  if (!token) return false;
  return verifyToken(token) !== null;
}


