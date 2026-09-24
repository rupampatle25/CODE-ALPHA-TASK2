import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { userRepo, workspaceRepo } from '@/lib/db';
import { User, WorkspaceRole } from '@/lib/db/types';

export const SESSION_COOKIE_NAME = 'sahayak_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'sahayak_super_secret_local_dev_key_2026';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  expiresAt: number;
}

// Generate HMAC signed token
export function signSession(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

// Verify HMAC signed token
export function verifySession(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(data)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Get current session from cookie in Server Actions or Route Handlers
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value || cookieStore.get('faqpilot_session')?.value;
  if (!token) return null;
  return verifySession(token);
}

// Get full current user record
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  const user = userRepo.findById(session.userId);
  return user || null;
}

// Verify user has access to specified workspace
export async function verifyWorkspaceAccess(
  userId: string, 
  workspaceId: string
): Promise<{ hasAccess: boolean; role?: WorkspaceRole; isAdmin?: boolean }> {
  const user = userRepo.findById(userId);
  if (user?.role === 'ADMIN') {
    return { hasAccess: true, role: 'ADMIN', isAdmin: true };
  }
  const workspaces = workspaceRepo.listForUser(userId);
  const ws = workspaces.find(w => w.id === workspaceId);
  if (!ws) {
    return { hasAccess: false, isAdmin: false };
  }
  const role: WorkspaceRole = ws.ownerId === userId ? 'OWNER' : 'ADMIN';
  return { hasAccess: true, role, isAdmin: role === 'OWNER' || role === 'ADMIN' };
}

// Verify admin access for sensitive server-side operations (RBAC)
export async function verifyAdminAccess(): Promise<{
  authorized: boolean;
  user?: User;
  session?: SessionPayload;
  error?: string;
  status: number;
}> {
  const session = await getSession();
  if (!session) {
    return { authorized: false, error: 'Unauthorized: Authentication required', status: 401 };
  }
  const user = userRepo.findById(session.userId);
  if (!user) {
    return { authorized: false, error: 'Unauthorized: User not found', status: 401 };
  }
  if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
    return { authorized: false, user, session, error: 'Forbidden: Administrator privileges required', status: 403 };
  }
  return { authorized: true, user, session, status: 200 };
}
