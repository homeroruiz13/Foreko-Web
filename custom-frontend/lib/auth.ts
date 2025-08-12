import { NextRequest } from 'next/server';
import { UserModel } from './models/user';
import { cookies } from 'next/headers';
import { getServerSideUserWithSession, getUserFromSessionToken, getSessionTokenFromRequest, getJWTTokenFromRequest } from './auth-session';

// Updated to use session-based authentication
export async function getServerSideUser() {
  return getServerSideUserWithSession();
}

export function getTokenFromRequest(request: NextRequest) {
  // Try session token first, fallback to JWT token
  return getSessionTokenFromRequest(request) || getJWTTokenFromRequest(request);
}

export async function getUserFromToken(token: string) {
  try {
    // Try session-based authentication first
    const userFromSession = await getUserFromSessionToken(token);
    if (userFromSession) {
      return userFromSession;
    }

    // Fallback to JWT-based authentication
    const decoded = UserModel.verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await UserModel.findById(decoded.userId);
    return user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}

// Legacy exports for backward compatibility
export { getUserFromSessionToken, getSessionTokenFromRequest, getJWTTokenFromRequest };