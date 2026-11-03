import crypto from 'crypto';
import { db, User } from './db.ts';

// Session storage: token -> { userId, expiresAt }
const sessions = new Map<string, { userId: string; expiresAt: number }>();
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const ADMIN_EMAILS = [
  'selvarajkasthuri15081984@gmail.com',
  'admin@flowora.ai',
];

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
}

export function createSession(userId: string): string {
  const token = 'flw_' + crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
}

export function validateSession(token: string): User | null {
  if (!token) return null;
  const sess = sessions.get(token);
  if (!sess) return null;

  if (Date.now() > sess.expiresAt) {
    sessions.delete(token);
    return null;
  }

  const user = db.getUserById(sess.userId);
  if (!user) {
    sessions.delete(token);
    return null;
  }

  return user;
}

export function revokeSession(token: string): void {
  sessions.delete(token);
}

export function ensureInitialAdmin(): void {
  const primaryAdminEmail = 'selvarajkasthuri15081984@gmail.com';
  let user = db.getUserByEmail(primaryAdminEmail);
  if (!user) {
    const { hash, salt } = hashPassword('AdminFlowora2026!');
    const newAdmin: User = {
      id: 'usr_admin_1',
      email: primaryAdminEmail,
      name: 'Selvaraj (Administrator)',
      role: 'admin',
      credits: 2500,
      plan: 'agency',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    db.createUser(newAdmin);
    db.addCredits(newAdmin.id, 2500, 'initial', 'Initial administrator credit allocation');
  } else if (user.role !== 'admin') {
    db.updateUser(user.id, { role: 'admin', plan: 'agency' });
  }
}

// Check if email should have admin role
export function determineRole(email: string): 'admin' | 'user' {
  if (ADMIN_EMAILS.includes(email.toLowerCase())) {
    return 'admin';
  }
  return 'user';
}
