import { NextRequest } from 'next/server';
import { UserModel } from './models/user';
import { UserSessionModel } from './models/user-session';
import { cookies } from 'next/headers';

export async function createUserSession(userId: string, request?: NextRequest, expiresInDays: number = 30) {
  const ipAddress = request ? getClientIP(request) : undefined;
  const userAgent = request ? request.headers.get('user-agent') || undefined : undefined;

  const session = await UserSessionModel.create({
    userId,
    ipAddress,
    userAgent,
    expiresInDays,
  });

  return session;
}

export async function getServerSideUserWithSession() {
  try {
    const cookieStore = cookies();
    const jwtToken = cookieStore.get('auth-token')?.value;
    const sessionToken = cookieStore.get('session-token')?.value;
    
    // If we have a JWT token, verify it (legacy support)
    if (jwtToken && !sessionToken) {
      const decoded = UserModel.verifyToken(jwtToken);
      if (!decoded) {
        return null;
      }
      const user = await UserModel.findById(decoded.userId);
      return user;
    }

    // Use session-based authentication
    if (!sessionToken) {
      return null;
    }

    const sessionValidation = await UserSessionModel.validateSession(sessionToken);
    if (!sessionValidation.valid || !sessionValidation.session) {
      return null;
    }

    const user = await UserModel.findById(sessionValidation.session.user_id);
    return user;
  } catch (error) {
    console.error('Error getting server side user with session:', error);
    return null;
  }
}

export function getSessionTokenFromRequest(request: NextRequest) {
  return request.cookies.get('session-token')?.value || null;
}

export function getJWTTokenFromRequest(request: NextRequest) {
  return request.cookies.get('auth-token')?.value || null;
}

export async function getUserFromSessionToken(sessionToken: string) {
  try {
    const sessionValidation = await UserSessionModel.validateSession(sessionToken);
    if (!sessionValidation.valid || !sessionValidation.session) {
      return null;
    }

    const user = await UserModel.findById(sessionValidation.session.user_id);
    return user;
  } catch (error) {
    console.error('Error getting user from session token:', error);
    return null;
  }
}

export async function revokeUserSession(sessionToken: string) {
  try {
    await UserSessionModel.deleteSession(sessionToken);
    return true;
  } catch (error) {
    console.error('Error revoking user session:', error);
    return false;
  }
}

export async function revokeAllUserSessions(userId: string) {
  try {
    await UserSessionModel.deleteAllUserSessions(userId);
    return true;
  } catch (error) {
    console.error('Error revoking all user sessions:', error);
    return false;
  }
}

export function getClientIP(request: NextRequest): string | undefined {
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