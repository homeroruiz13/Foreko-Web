import { query } from '../db';

export interface APIRequest {
  id: string;
  company_id?: string;
  user_id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms?: number;
  ip_address?: string;
  user_agent?: string;
  request_headers?: any;
  request_body?: any;
  response_body?: any;
  error_message?: string;
  created_at: Date;
}

export interface ErrorLog {
  id: string;
  company_id?: string;
  user_id?: string;
  error_type: string;
  error_message: string;
  stack_trace?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  resolved: boolean;
  resolved_at?: Date;
  created_at: Date;
}

export interface SystemMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  tags?: any;
  recorded_at: Date;
}

export class MonitoringModel {
  static async logAPIRequest(data: {
    company_id?: string;
    user_id?: string;
    endpoint: string;
    method: string;
    status_code: number;
    response_time_ms?: number;
    ip_address?: string;
    user_agent?: string;
    request_headers?: any;
    request_body?: any;
    response_body?: any;
    error_message?: string;
  }): Promise<APIRequest> {
    const result = await query(
      `INSERT INTO monitoring.api_requests (
        company_id, user_id, endpoint, method, status_code, response_time_ms,
        ip_address, user_agent, request_headers, request_body, response_body,
        error_message, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      RETURNING *`,
      [
        data.company_id,
        data.user_id,
        data.endpoint,
        data.method,
        data.status_code,
        data.response_time_ms,
        data.ip_address,
        data.user_agent,
        data.request_headers ? JSON.stringify(data.request_headers) : null,
        data.request_body ? JSON.stringify(data.request_body) : null,
        data.response_body ? JSON.stringify(data.response_body) : null,
        data.error_message
      ]
    );
    return result.rows[0];
  }

  static async logError(data: {
    company_id?: string;
    user_id?: string;
    error_type: string;
    error_message: string;
    stack_trace?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    context?: any;
  }): Promise<ErrorLog> {
    const result = await query(
      `INSERT INTO monitoring.error_logs (
        company_id, user_id, error_type, error_message, stack_trace,
        severity, context, resolved, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *`,
      [
        data.company_id,
        data.user_id,
        data.error_type,
        data.error_message,
        data.stack_trace,
        data.severity || 'medium',
        data.context ? JSON.stringify(data.context) : null,
        false
      ]
    );
    return result.rows[0];
  }

  static async recordSystemMetric(data: {
    metric_name: string;
    metric_value: number;
    metric_unit?: string;
    tags?: any;
  }): Promise<SystemMetric> {
    const result = await query(
      `INSERT INTO monitoring.system_metrics (
        metric_name, metric_value, metric_unit, tags, recorded_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *`,
      [
        data.metric_name,
        data.metric_value,
        data.metric_unit,
        data.tags ? JSON.stringify(data.tags) : null
      ]
    );
    return result.rows[0];
  }

  static async getAPIAnalytics(companyId?: string, hours: number = 24): Promise<{
    total_requests: number;
    avg_response_time: number;
    success_rate: number;
    error_rate: number;
  }> {
    const whereClause = companyId ? 'WHERE company_id = $2 AND' : 'WHERE';
    const params = companyId ? [hours, companyId] : [hours];
    
    const result = await query(
      `SELECT 
        COUNT(*) as total_requests,
        AVG(response_time_ms) as avg_response_time,
        (COUNT(*) FILTER (WHERE status_code < 400)::float / COUNT(*) * 100) as success_rate,
        (COUNT(*) FILTER (WHERE status_code >= 400)::float / COUNT(*) * 100) as error_rate
      FROM monitoring.api_requests 
      ${whereClause} created_at >= NOW() - INTERVAL '${hours} hours'`,
      params
    );
    
    return result.rows[0] || { 
      total_requests: 0, 
      avg_response_time: 0, 
      success_rate: 0, 
      error_rate: 0 
    };
  }

  static async getTopEndpoints(companyId?: string, limit: number = 10): Promise<{
    endpoint: string;
    request_count: number;
    avg_response_time: number;
  }[]> {
    const whereClause = companyId ? 'WHERE company_id = $2' : '';
    const params = companyId ? [limit, companyId] : [limit];
    
    const result = await query(
      `SELECT 
        endpoint,
        COUNT(*) as request_count,
        AVG(response_time_ms) as avg_response_time
      FROM monitoring.api_requests 
      ${whereClause}
      GROUP BY endpoint 
      ORDER BY request_count DESC 
      LIMIT $1`,
      params
    );
    
    return result.rows;
  }

  static async getRecentErrors(companyId?: string, limit: number = 50): Promise<ErrorLog[]> {
    const whereClause = companyId ? 'WHERE company_id = $2' : '';
    const params = companyId ? [limit, companyId] : [limit];
    
    const result = await query(
      `SELECT * FROM monitoring.error_logs 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $1`,
      params
    );
    
    return result.rows;
  }

  static async resolveError(id: string): Promise<ErrorLog> {
    const result = await query(
      'UPDATE monitoring.error_logs SET resolved = true, resolved_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}