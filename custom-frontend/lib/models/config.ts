import { query } from '../db';

export interface FeatureFlag {
  id: string;
  flag_key: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_users?: string[];
  target_companies?: string[];
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface RateLimit {
  id: string;
  company_id?: string;
  plan_id?: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  created_at: Date;
  updated_at: Date;
}

export interface Webhook {
  id: string;
  company_id: string;
  name: string;
  url: string;
  events: string[];
  secret_key: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class ConfigModel {
  // Feature Flags
  static async getFeatureFlag(flagKey: string): Promise<FeatureFlag | null> {
    const result = await query(
      'SELECT * FROM config.feature_flags WHERE flag_key = $1',
      [flagKey]
    );
    return result.rows[0] || null;
  }

  static async isFeatureEnabled(flagKey: string, userId?: string, companyId?: string): Promise<boolean> {
    const flag = await this.getFeatureFlag(flagKey);
    if (!flag || !flag.is_enabled) {
      return false;
    }

    // Check if it's a full rollout
    if (flag.rollout_percentage >= 100) {
      return true;
    }

    // Check target companies
    if (companyId && flag.target_companies && flag.target_companies.includes(companyId)) {
      return true;
    }

    // Check target users
    if (userId && flag.target_users && flag.target_users.includes(userId)) {
      return true;
    }

    // Check rollout percentage based on user/company ID
    if (userId || companyId) {
      const id = userId || companyId;
      const hash = this.hashString(id!);
      const percentage = hash % 100;
      return percentage < flag.rollout_percentage;
    }

    return false;
  }

  static async createFeatureFlag(data: {
    flag_key: string;
    is_enabled: boolean;
    rollout_percentage?: number;
    target_users?: string[];
    target_companies?: string[];
    description?: string;
  }): Promise<FeatureFlag> {
    const result = await query(
      `INSERT INTO config.feature_flags (
        flag_key, is_enabled, rollout_percentage, target_users, 
        target_companies, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [
        data.flag_key,
        data.is_enabled,
        data.rollout_percentage || 0,
        data.target_users,
        data.target_companies,
        data.description
      ]
    );
    return result.rows[0];
  }

  static async updateFeatureFlag(flagKey: string, updates: {
    is_enabled?: boolean;
    rollout_percentage?: number;
    target_users?: string[];
    target_companies?: string[];
    description?: string;
  }): Promise<FeatureFlag> {
    const result = await query(
      `UPDATE config.feature_flags SET
        is_enabled = COALESCE($1, is_enabled),
        rollout_percentage = COALESCE($2, rollout_percentage),
        target_users = COALESCE($3, target_users),
        target_companies = COALESCE($4, target_companies),
        description = COALESCE($5, description),
        updated_at = NOW()
      WHERE flag_key = $6 RETURNING *`,
      [
        updates.is_enabled,
        updates.rollout_percentage,
        updates.target_users,
        updates.target_companies,
        updates.description,
        flagKey
      ]
    );
    return result.rows[0];
  }

  // System Settings
  static async getSystemSetting(settingKey: string): Promise<SystemSetting | null> {
    const result = await query(
      'SELECT * FROM config.system_settings WHERE setting_key = $1',
      [settingKey]
    );
    return result.rows[0] || null;
  }

  static async getSystemSettingValue(settingKey: string): Promise<any> {
    const setting = await this.getSystemSetting(settingKey);
    if (!setting) return null;

    switch (setting.setting_type) {
      case 'number':
        return parseFloat(setting.setting_value);
      case 'boolean':
        return setting.setting_value.toLowerCase() === 'true';
      case 'json':
        return JSON.parse(setting.setting_value);
      default:
        return setting.setting_value;
    }
  }

  static async setSystemSetting(
    settingKey: string,
    value: any,
    settingType: 'string' | 'number' | 'boolean' | 'json' = 'string',
    description?: string
  ): Promise<SystemSetting> {
    let settingValue: string;
    
    switch (settingType) {
      case 'json':
        settingValue = JSON.stringify(value);
        break;
      default:
        settingValue = String(value);
    }

    const result = await query(
      `INSERT INTO config.system_settings (setting_key, setting_value, setting_type, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (setting_key) DO UPDATE SET
         setting_value = EXCLUDED.setting_value,
         setting_type = EXCLUDED.setting_type,
         description = COALESCE(EXCLUDED.description, config.system_settings.description),
         updated_at = NOW()
       RETURNING *`,
      [settingKey, settingValue, settingType, description]
    );
    return result.rows[0];
  }

  // Rate Limits
  static async getRateLimit(companyId?: string, planId?: string, endpointPattern?: string): Promise<RateLimit | null> {
    let query_text = 'SELECT * FROM config.rate_limits WHERE 1=1';
    const params: any[] = [];

    if (companyId) {
      params.push(companyId);
      query_text += ` AND company_id = $${params.length}`;
    }

    if (planId) {
      params.push(planId);
      query_text += ` AND plan_id = $${params.length}`;
    }

    if (endpointPattern) {
      params.push(endpointPattern);
      query_text += ` AND endpoint_pattern = $${params.length}`;
    }

    query_text += ' LIMIT 1';

    const result = await query(query_text, params);
    return result.rows[0] || null;
  }

  static async createRateLimit(data: {
    company_id?: string;
    plan_id?: string;
    endpoint_pattern: string;
    requests_per_minute: number;
    requests_per_hour: number;
    requests_per_day: number;
  }): Promise<RateLimit> {
    const result = await query(
      `INSERT INTO config.rate_limits (
        company_id, plan_id, endpoint_pattern, requests_per_minute,
        requests_per_hour, requests_per_day, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [
        data.company_id,
        data.plan_id,
        data.endpoint_pattern,
        data.requests_per_minute,
        data.requests_per_hour,
        data.requests_per_day
      ]
    );
    return result.rows[0];
  }

  // Webhooks
  static async createWebhook(data: {
    company_id: string;
    name: string;
    url: string;
    events: string[];
    secret_key: string;
  }): Promise<Webhook> {
    const result = await query(
      `INSERT INTO config.webhooks (
        company_id, name, url, events, secret_key, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [data.company_id, data.name, data.url, data.events, data.secret_key, true]
    );
    return result.rows[0];
  }

  static async getWebhooksByCompany(companyId: string): Promise<Webhook[]> {
    const result = await query(
      'SELECT * FROM config.webhooks WHERE company_id = $1 ORDER BY created_at DESC',
      [companyId]
    );
    return result.rows;
  }

  static async updateWebhook(id: string, updates: {
    name?: string;
    url?: string;
    events?: string[];
    is_active?: boolean;
  }): Promise<Webhook> {
    const result = await query(
      `UPDATE config.webhooks SET
        name = COALESCE($1, name),
        url = COALESCE($2, url),
        events = COALESCE($3, events),
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
      WHERE id = $5 RETURNING *`,
      [updates.name, updates.url, updates.events, updates.is_active, id]
    );
    return result.rows[0];
  }

  // Utility function for consistent hashing
  private static hashString(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}