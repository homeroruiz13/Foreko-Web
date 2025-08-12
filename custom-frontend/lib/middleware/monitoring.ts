import { NextRequest, NextResponse } from 'next/server';
import { MonitoringModel } from '../models/monitoring';
import { getUserFromToken, getTokenFromRequest } from '../auth';

export async function monitoringMiddleware(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
  error?: Error
) {
  try {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Get user context
    const token = getTokenFromRequest(request);
    let userId: string | undefined;
    let companyId: string | undefined;

    if (token) {
      const user = await getUserFromToken(token);
      if (user) {
        userId = user.id;
        // You might need to get the company ID from user context or request
        // companyId = request.headers.get('x-company-id') || undefined;
      }
    }

    // Extract request info
    const endpoint = request.nextUrl.pathname;
    const method = request.method;
    const statusCode = response.status;
    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || undefined;

    // Log the API request
    await MonitoringModel.logAPIRequest({
      company_id: companyId,
      user_id: userId,
      endpoint,
      method,
      status_code: statusCode,
      response_time_ms: responseTime,
      ip_address: ipAddress,
      user_agent: userAgent,
      error_message: error?.message
    });

    // Log error if present
    if (error) {
      await MonitoringModel.logError({
        company_id: companyId,
        user_id: userId,
        error_type: error.constructor.name,
        error_message: error.message,
        stack_trace: error.stack,
        severity: statusCode >= 500 ? 'high' : 'medium',
        context: {
          endpoint,
          method,
          status_code: statusCode,
          user_agent: userAgent,
          ip_address: ipAddress
        }
      });
    }
  } catch (monitoringError) {
    // Don't throw errors from monitoring to avoid breaking the actual request
    console.error('Monitoring middleware error:', monitoringError);
  }
}

function getClientIP(request: NextRequest): string | undefined {
  // Try to get IP from various headers (in order of preference)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }
  
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  if (realIp) {
    return realIp;
  }

  // Fallback to connection remote address (might not be available in all environments)
  return undefined;
}

// Helper function to wrap API routes with monitoring
export function withMonitoring<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = Date.now();
    let error: Error | undefined;
    let result: R | undefined;

    try {
      result = await handler(...args);
      return result;
    } catch (err) {
      error = err as Error;
      throw err;
    } finally {
      // If we have request/response objects, log the monitoring data
      if (args.length >= 1 && args[0] && typeof args[0] === 'object') {
        const request = args[0] as NextRequest;
        // Only use response if result is defined and is a NextResponse
        const response = result && typeof result === 'object' && 'status' in (result as any) 
          ? result as unknown as NextResponse 
          : undefined;
        
        if (request.nextUrl && response) {
          await monitoringMiddleware(request, response, startTime, error);
        }
      }
    }
  };
}