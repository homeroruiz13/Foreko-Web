import crypto from 'crypto';
import { query } from '../db';

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSessionData {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  expiresInDays?: number;
}

export class UserSessionModel {
  static async create(sessionData: CreateSessionData): Promise<UserSession> {
    const { userId, ipAddress, userAgent, expiresInDays = 30 } = sessionData;
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const result = await query(
      `INSERT INTO auth.user_sessions (user_id, session_token, ip_address, user_agent, expires_at, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, user_id, session_token, ip_address, user_agent, expires_at, created_at, updated_at`,
      [userId, sessionToken, ipAddress, userAgent, expiresAt]
    );

    return result.rows[0];
  }

  static async findByToken(sessionToken: string): Promise<UserSession | null> {
    const result = await query(
      'SELECT id, user_id, session_token, ip_address, user_agent, expires_at, created_at, updated_at FROM auth.user_sessions WHERE session_token = $1',
      [sessionToken]
    );

    return result.rows[0] || null;
  }

  static async findByUserId(userId: string): Promise<UserSession[]> {
    const result = await query(
      'SELECT id, user_id, session_token, ip_address, user_agent, expires_at, created_at, updated_at FROM auth.user_sessions WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    return result.rows;
  }

  static async validateSession(sessionToken: string): Promise<{ valid: boolean; session?: UserSession; error?: string }> {
    const session = await this.findByToken(sessionToken);
    
    if (!session) {
      return { valid: false, error: 'Session not found' };
    }

    if (new Date() > session.expires_at) {
      // Clean up expired session
      await this.deleteSession(sessionToken);
      return { valid: false, error: 'Session has expired' };
    }

    // Update session activity
    await this.updateLastActivity(sessionToken);

    return { valid: true, session };
  }

  static async updateLastActivity(sessionToken: string): Promise<void> {
    await query(
      'UPDATE auth.user_sessions SET updated_at = NOW() WHERE session_token = $1',
      [sessionToken]
    );
  }

  static async deleteSession(sessionToken: string): Promise<void> {
    await query(
      'DELETE FROM auth.user_sessions WHERE session_token = $1',
      [sessionToken]
    );
  }

  static async deleteAllUserSessions(userId: string): Promise<void> {
    await query(
      'DELETE FROM auth.user_sessions WHERE user_id = $1',
      [userId]
    );
  }

  static async deleteExpiredSessions(): Promise<void> {
    await query(
      'DELETE FROM auth.user_sessions WHERE expires_at < NOW()'
    );
  }

  static async extendSession(sessionToken: string, days: number = 30): Promise<void> {
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await query(
      'UPDATE auth.user_sessions SET expires_at = $1, updated_at = NOW() WHERE session_token = $2',
      [expiresAt, sessionToken]
    );
  }

  static async countActiveSessions(userId: string): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM auth.user_sessions WHERE user_id = $1 AND expires_at > NOW()',
      [userId]
    );

    return parseInt(result.rows[0].count);
  }

  static async getSessionInfo(sessionToken: string): Promise<{
    id: string;
    ip_address?: string;
    user_agent?: string;
    created_at: Date;
    updated_at: Date;
    is_current?: boolean;
  } | null> {
    const result = await query(
      'SELECT id, ip_address, user_agent, created_at, updated_at FROM auth.user_sessions WHERE session_token = $1',
      [sessionToken]
    );

    if (!result.rows[0]) {
      return null;
    }

    return {
      ...result.rows[0],
      is_current: true // This would be determined by comparing with current session token
    };
  }
}