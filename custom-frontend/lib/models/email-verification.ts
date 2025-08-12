import crypto from 'crypto';
import { query } from '../db';

export interface EmailVerification {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  is_used: boolean;
  used_at?: Date;
  created_at: Date;
}

export class EmailVerificationModel {
  static async create(userId: string): Promise<EmailVerification> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await query(
      `INSERT INTO auth.email_verifications (user_id, token, expires_at, is_used, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, user_id, token, expires_at, is_used, used_at, created_at`,
      [userId, token, expiresAt, false]
    );

    return result.rows[0];
  }

  static async findByToken(token: string): Promise<EmailVerification | null> {
    const result = await query(
      'SELECT id, user_id, token, expires_at, is_used, used_at, created_at FROM auth.email_verifications WHERE token = $1',
      [token]
    );

    return result.rows[0] || null;
  }

  static async verifyToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    const verification = await this.findByToken(token);
    
    if (!verification) {
      return { success: false, error: 'Invalid verification token' };
    }

    if (verification.is_used) {
      return { success: false, error: 'Verification token has already been used' };
    }

    if (new Date() > verification.expires_at) {
      return { success: false, error: 'Verification token has expired' };
    }

    // Mark token as used
    await query(
      'UPDATE auth.email_verifications SET is_used = true, used_at = NOW() WHERE id = $1',
      [verification.id]
    );

    // Update user status to active and set email_verified_at
    await query(
      'UPDATE auth.users SET status = $1, email_verified_at = NOW(), updated_at = NOW() WHERE id = $2',
      ['active', verification.user_id]
    );

    return { success: true, userId: verification.user_id };
  }

  static async markAsUsed(id: string): Promise<void> {
    await query(
      'UPDATE auth.email_verifications SET is_used = true, used_at = NOW() WHERE id = $1',
      [id]
    );
  }

  static async cleanupExpired(): Promise<void> {
    await query(
      'DELETE FROM auth.email_verifications WHERE expires_at < NOW() AND is_used = false'
    );
  }
}