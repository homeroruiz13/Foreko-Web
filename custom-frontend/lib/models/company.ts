import { query } from '../db';

export interface Company {
  id: string;
  name: string;
  industry?: string;
  stripe_customer_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserCompany {
  id: string;
  user_id: string;
  company_id: string;
  role: 'owner' | 'admin' | 'member';
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyData {
  name: string;
  industry?: string;
  user_role: string; // This will be used to determine the role in the company
}

export class CompanyModel {
  static async createCompany(companyData: CreateCompanyData, userId: string): Promise<{ company: Company; userCompany: UserCompany }> {
    const { name, industry, user_role } = companyData;
    
    try {
      // Start transaction
      await query('BEGIN');
      
      // Create the company
      const companyResult = await query(
        `INSERT INTO companies (name, industry, created_at, updated_at) 
         VALUES ($1, $2, NOW(), NOW()) 
         RETURNING id, name, industry, stripe_customer_id, created_at, updated_at`,
        [name, industry || null]
      );

      const company = companyResult.rows[0];

      // Determine user role in company (owner for first user)
      const role = 'owner'; // First user is always owner
      
      // Create user-company relationship
      const userCompanyResult = await query(
        `INSERT INTO user_companies (user_id, company_id, role, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING id, user_id, company_id, role, created_at, updated_at`,
        [userId, company.id, role]
      );

      const userCompany = userCompanyResult.rows[0];

      // Commit transaction
      await query('COMMIT');

      return { company, userCompany };
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  }

  static async findByUserId(userId: string): Promise<(Company & { role: string })[]> {
    const result = await query(
      `SELECT c.id, c.name, c.industry, c.stripe_customer_id, c.created_at, c.updated_at, uc.role 
       FROM companies c 
       JOIN user_companies uc ON c.id = uc.company_id 
       WHERE uc.user_id = $1`,
      [userId]
    );

    return result.rows;
  }

  static async findById(companyId: string): Promise<Company | null> {
    const result = await query(
      'SELECT id, name, industry, stripe_customer_id, created_at, updated_at FROM companies WHERE id = $1',
      [companyId]
    );

    return result.rows[0] || null;
  }

  static async getUserCompanyRole(userId: string, companyId: string): Promise<string | null> {
    const result = await query(
      'SELECT role FROM user_companies WHERE user_id = $1 AND company_id = $2',
      [userId, companyId]
    );

    return result.rows[0]?.role || null;
  }
}