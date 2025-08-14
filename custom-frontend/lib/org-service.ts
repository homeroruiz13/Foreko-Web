import { Pool } from 'pg';
import { getPool } from './db';
import crypto from 'crypto';

export interface Company {
  id?: string;
  name: string;
  industry?: string;
  stripe_customer_id?: string;
  website?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserCompany {
  id?: string;
  user_id: string;
  company_id: string;
  role: 'owner' | 'admin' | 'member';
  invited_by?: string;
  joined_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CompanyInvitation {
  id?: string;
  company_id: string;
  email: string;
  role: 'admin' | 'member';
  token: string;
  expires_at: Date;
  is_used?: boolean;
  used_at?: Date;
  invited_by: string;
  invited_at?: Date;
  accepted_at?: Date;
}

export interface CompanySetting {
  id?: string;
  company_id: string;
  setting_key: string;
  setting_value?: string;
  setting_type?: 'string' | 'number' | 'boolean' | 'json';
  created_at?: Date;
  updated_at?: Date;
}

export interface CompanyAuditLog {
  id?: string;
  company_id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export class OrganizationService {
  private static pool: Pool;

  private static async getPool(): Promise<Pool> {
    if (!this.pool) {
      this.pool = getPool();
    }
    return this.pool;
  }

  // =====================
  // COMPANY MANAGEMENT
  // =====================
  static async createCompany(company: Company, ownerId: string): Promise<string> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create company
      const companyResult = await client.query(
        `INSERT INTO org.companies (name, industry, website, phone, address_line1, address_line2, city, state, postal_code, country)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          company.name,
          company.industry,
          company.website,
          company.phone,
          company.address_line1,
          company.address_line2,
          company.city,
          company.state,
          company.postal_code,
          company.country
        ]
      );

      const companyId = companyResult.rows[0].id;

      // Add owner to company
      await client.query(
        `INSERT INTO org.user_companies (user_id, company_id, role)
         VALUES ($1, $2, 'owner')`,
        [ownerId, companyId]
      );

      await client.query('COMMIT');
      return companyId;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getCompany(companyId: string): Promise<Company | null> {
    const pool = await this.getPool();
    const result = await pool.query(
      'SELECT * FROM org.companies WHERE id = $1',
      [companyId]
    );
    return result.rows[0] || null;
  }

  static async updateCompany(companyId: string, updates: Partial<Company>): Promise<void> {
    const pool = await this.getPool();
    
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) return;

    values.push(companyId);
    
    await pool.query(
      `UPDATE org.companies SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  static async getUserCompanies(userId: string): Promise<(Company & UserCompany)[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      `SELECT c.*, uc.role, uc.joined_at
       FROM org.companies c
       INNER JOIN org.user_companies uc ON c.id = uc.company_id
       WHERE uc.user_id = $1
       ORDER BY uc.joined_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async getUserRole(userId: string, companyId: string): Promise<'owner' | 'admin' | 'member' | null> {
    const pool = await this.getPool();
    const result = await pool.query(
      'SELECT role FROM org.user_companies WHERE user_id = $1 AND company_id = $2',
      [userId, companyId]
    );
    return result.rows[0]?.role || null;
  }

  static async checkUserAccess(userId: string, companyId: string, requiredRole: 'owner' | 'admin' | 'member' = 'member'): Promise<boolean> {
    const pool = await this.getPool();
    const result = await pool.query(
      'SELECT org.user_has_company_access($1, $2, $3) as has_access',
      [userId, companyId, requiredRole]
    );
    return result.rows[0]?.has_access || false;
  }

  // =====================
  // INVITATION MANAGEMENT
  // =====================
  static async createInvitation(invitation: Omit<CompanyInvitation, 'id' | 'token' | 'invited_at'>): Promise<string> {
    const pool = await this.getPool();
    
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const result = await pool.query(
      `INSERT INTO org.company_invitations (company_id, email, role, token, expires_at, invited_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [invitation.company_id, invitation.email, invitation.role, token, expiresAt, invitation.invited_by]
    );

    return result.rows[0].id;
  }

  static async getInvitation(token: string): Promise<CompanyInvitation | null> {
    const pool = await this.getPool();
    const result = await pool.query(
      'SELECT * FROM org.company_invitations WHERE token = $1 AND NOT is_used AND expires_at > NOW()',
      [token]
    );
    return result.rows[0] || null;
  }

  static async acceptInvitation(token: string, userId: string): Promise<boolean> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get invitation details
      const invitationResult = await client.query(
        'SELECT * FROM org.company_invitations WHERE token = $1 AND NOT is_used AND expires_at > NOW()',
        [token]
      );

      if (invitationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const invitation = invitationResult.rows[0];

      // Add user to company
      await client.query(
        `INSERT INTO org.user_companies (user_id, company_id, role, invited_by)
         VALUES ($1, $2, $3, $4)`,
        [userId, invitation.company_id, invitation.role, invitation.invited_by]
      );

      // Mark invitation as used
      await client.query(
        'UPDATE org.company_invitations SET is_used = TRUE, used_at = NOW(), accepted_at = NOW() WHERE id = $1',
        [invitation.id]
      );

      await client.query('COMMIT');
      return true;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getCompanyInvitations(companyId: string): Promise<CompanyInvitation[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      `SELECT ci.*, u.name as invited_by_name
       FROM org.company_invitations ci
       LEFT JOIN auth.users u ON ci.invited_by = u.id
       WHERE ci.company_id = $1
       ORDER BY ci.invited_at DESC`,
      [companyId]
    );
    return result.rows;
  }

  static async cancelInvitation(invitationId: string, companyId: string): Promise<boolean> {
    const pool = await this.getPool();
    const result = await pool.query(
      'DELETE FROM org.company_invitations WHERE id = $1 AND company_id = $2 AND NOT is_used',
      [invitationId, companyId]
    );
    return (result.rowCount || 0) > 0;
  }

  // =====================
  // SETTINGS MANAGEMENT
  // =====================
  static async setSetting(companyId: string, key: string, value: string, type: 'string' | 'number' | 'boolean' | 'json' = 'string'): Promise<void> {
    const pool = await this.getPool();
    await pool.query(
      `INSERT INTO org.company_settings (company_id, setting_key, setting_value, setting_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (company_id, setting_key)
       DO UPDATE SET setting_value = EXCLUDED.setting_value, setting_type = EXCLUDED.setting_type, updated_at = NOW()`,
      [companyId, key, value, type]
    );
  }

  static async getSetting(companyId: string, key: string): Promise<CompanySetting | null> {
    const pool = await this.getPool();
    const result = await pool.query(
      'SELECT * FROM org.company_settings WHERE company_id = $1 AND setting_key = $2',
      [companyId, key]
    );
    return result.rows[0] || null;
  }

  static async getSettings(companyId: string): Promise<CompanySetting[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      'SELECT * FROM org.company_settings WHERE company_id = $1 ORDER BY setting_key',
      [companyId]
    );
    return result.rows;
  }

  static async deleteSetting(companyId: string, key: string): Promise<boolean> {
    const pool = await this.getPool();
    const result = await pool.query(
      'DELETE FROM org.company_settings WHERE company_id = $1 AND setting_key = $2',
      [companyId, key]
    );
    return (result.rowCount || 0) > 0;
  }

  // =====================
  // AUDIT LOGGING
  // =====================
  static async logAuditEvent(audit: CompanyAuditLog): Promise<void> {
    const pool = await this.getPool();
    await pool.query(
      `INSERT INTO org.company_audit_log (company_id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        audit.company_id,
        audit.user_id,
        audit.action,
        audit.resource_type,
        audit.resource_id,
        audit.old_values ? JSON.stringify(audit.old_values) : null,
        audit.new_values ? JSON.stringify(audit.new_values) : null,
        audit.ip_address,
        audit.user_agent
      ]
    );
  }

  static async getAuditLog(companyId: string, limit = 50, offset = 0): Promise<CompanyAuditLog[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      `SELECT cal.*, u.name as user_name
       FROM org.company_audit_log cal
       LEFT JOIN auth.users u ON cal.user_id = u.id
       WHERE cal.company_id = $1
       ORDER BY cal.created_at DESC
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset]
    );
    return result.rows;
  }

  // =====================
  // TEAM MANAGEMENT
  // =====================
  static async getCompanyMembers(companyId: string): Promise<(UserCompany & { name: string; email: string })[]> {
    const pool = await this.getPool();
    const result = await pool.query(
      `SELECT uc.*, u.name, u.email
       FROM org.user_companies uc
       INNER JOIN auth.users u ON uc.user_id = u.id
       WHERE uc.company_id = $1
       ORDER BY 
         CASE uc.role 
           WHEN 'owner' THEN 1
           WHEN 'admin' THEN 2
           WHEN 'member' THEN 3
         END,
         uc.joined_at ASC`,
      [companyId]
    );
    return result.rows;
  }

  static async updateMemberRole(companyId: string, userId: string, newRole: 'admin' | 'member', updatedBy: string): Promise<boolean> {
    const pool = await this.getPool();

    const result = await pool.query(
      `UPDATE org.user_companies 
       SET role = $1 
       WHERE company_id = $2 AND user_id = $3 AND role != 'owner'`,
      [newRole, companyId, userId]
    );

    if ((result.rowCount || 0) > 0) {
      // Log the role change
      await this.logAuditEvent({
        company_id: companyId,
        user_id: updatedBy,
        action: 'member_role_updated',
        resource_type: 'user_company',
        resource_id: userId,
        new_values: { role: newRole }
      });
    }

    return (result.rowCount || 0) > 0;
  }

  static async removeMember(companyId: string, userId: string, removedBy: string): Promise<boolean> {
    const pool = await this.getPool();
    
    // Cannot remove the last owner
    const result = await pool.query(
      `DELETE FROM org.user_companies 
       WHERE company_id = $1 AND user_id = $2 AND role != 'owner'`,
      [companyId, userId]
    );

    if ((result.rowCount || 0) > 0) {
      // Log the removal
      await this.logAuditEvent({
        company_id: companyId,
        user_id: removedBy,
        action: 'member_removed',
        resource_type: 'user_company',
        resource_id: userId
      });
    }

    return (result.rowCount || 0) > 0;
  }
}