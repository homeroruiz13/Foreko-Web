import crypto from 'crypto';
import { query } from '../db';

export interface PasswordReset {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  is_used: boolean;
  used_at?: Date;
  created_at: Date;
}

export class PasswordResetModel {
  static async create(userId: string): Promise<PasswordReset> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const result = await query(
      `INSERT INTO auth.password_resets (user_id, token, expires_at, is_used, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, user_id, token, expires_at, is_used, used_at, created_at`,
      [userId, token, expiresAt, false]
    );

    return result.rows[0];
  }

  static async findByToken(token: string): Promise<PasswordReset | null> {
    const result = await query(
      'SELECT id, user_id, token, expires_at, is_used, used_at, created_at FROM auth.password_resets WHERE token = $1',
      [token]
    );

    return result.rows[0] || null;
  }

  static async validateToken(token: string): Promise<{ valid: boolean; userId?: string; error?: string }> {
    const reset = await this.findByToken(token);
    
    if (!reset) {
      return { valid: false, error: 'Invalid reset token' };
    }

    if (reset.is_used) {
      return { valid: false, error: 'Reset token has already been used' };
    }

    if (new Date() > reset.expires_at) {
      return { valid: false, error: 'Reset token has expired' };
    }

    return { valid: true, userId: reset.user_id };
  }

  static async markAsUsed(token: string): Promise<void> {
    await query(
      'UPDATE auth.password_resets SET is_used = true, used_at = NOW() WHERE token = $1',
      [token]
    );
  }

  static async cleanupExpired(): Promise<void> {
    await query(
      'DELETE FROM auth.password_resets WHERE expires_at < NOW() AND is_used = false'
    );
  }

  static async invalidateAllForUser(userId: string): Promise<void> {
    await query(
      'UPDATE auth.password_resets SET is_used = true, used_at = NOW() WHERE user_id = $1 AND is_used = false',
      [userId]
    );
  }
}