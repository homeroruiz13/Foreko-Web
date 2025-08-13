import { query } from '../db';

export type OAuthProvider = 'google' | 'microsoft' | 'facebook' | 'apple';

export interface UserProvider {
  id: string;
  user_id: string;
  provider: OAuthProvider;
  provider_uid: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserProviderData {
  user_id: string;
  provider: OAuthProvider;
  provider_uid: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
}

export interface UpdateTokensData {
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
}

export class UserProviderModel {
  
  static async create(data: CreateUserProviderData): Promise<UserProvider> {
    const queryText = `
      INSERT INTO auth.user_providers (
        user_id, provider, provider_uid, access_token, refresh_token, token_expires_at
      ) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      data.user_id,
      data.provider,
      data.provider_uid,
      data.access_token || null,
      data.refresh_token || null,
      data.token_expires_at || null
    ];
    
    const result = await query(queryText, values);
    return result.rows[0];
  }
  
  static async findByProviderAndUid(provider: OAuthProvider, provider_uid: string): Promise<UserProvider | null> {
    const queryText = `
      SELECT * FROM auth.user_providers 
      WHERE provider = $1 AND provider_uid = $2
    `;
    
    const result = await query(queryText, [provider, provider_uid]);
    return result.rows[0] || null;
  }
  
  static async findByUserId(userId: string): Promise<UserProvider[]> {
    const queryText = `
      SELECT * FROM auth.user_providers 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await query(queryText, [userId]);
    return result.rows;
  }
  
  static async findByUserAndProvider(userId: string, provider: OAuthProvider): Promise<UserProvider | null> {
    const queryText = `
      SELECT * FROM auth.user_providers 
      WHERE user_id = $1 AND provider = $2
    `;
    
    const result = await query(queryText, [userId, provider]);
    return result.rows[0] || null;
  }
  
  static async updateTokens(id: string, tokenData: UpdateTokensData): Promise<UserProvider> {
    const setParts: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (tokenData.access_token !== undefined) {
      setParts.push(`access_token = $${paramIndex++}`);
      values.push(tokenData.access_token);
    }
    
    if (tokenData.refresh_token !== undefined) {
      setParts.push(`refresh_token = $${paramIndex++}`);
      values.push(tokenData.refresh_token);
    }
    
    if (tokenData.token_expires_at !== undefined) {
      setParts.push(`token_expires_at = $${paramIndex++}`);
      values.push(tokenData.token_expires_at);
    }
    
    setParts.push(`updated_at = NOW()`);
    values.push(id);
    
    const queryText = `
      UPDATE auth.user_providers 
      SET ${setParts.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await query(queryText, values);
    return result.rows[0];
  }
  
  static async deleteByUserAndProvider(userId: string, provider: OAuthProvider): Promise<boolean> {
    const queryText = `
      DELETE FROM auth.user_providers 
      WHERE user_id = $1 AND provider = $2
    `;
    
    const result = await query(queryText, [userId, provider]);
    return (result.rowCount || 0) > 0;
  }
  
  static async deleteById(id: string): Promise<boolean> {
    const queryText = `DELETE FROM auth.user_providers WHERE id = $1`;
    const result = await query(queryText, [id]);
    return (result.rowCount || 0) > 0;
  }
  
  static async getProvidersByUser(userId: string): Promise<{ provider: OAuthProvider; connected_at: Date }[]> {
    const queryText = `
      SELECT provider, created_at as connected_at 
      FROM auth.user_providers 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `;
    
    const result = await query(queryText, [userId]);
    return result.rows;
  }
  
  static async refreshExpiredTokens(): Promise<void> {
    // This could be expanded to handle token refresh logic for providers that support it
    const queryText = `
      UPDATE auth.user_providers 
      SET access_token = NULL, refresh_token = NULL 
      WHERE token_expires_at < NOW() AND token_expires_at IS NOT NULL
    `;
    
    await query(queryText);
  }
}