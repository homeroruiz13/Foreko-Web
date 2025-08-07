import { NextRequest } from 'next/server';
import { UserModel } from './models/user';
import { cookies } from 'next/headers';

export async function getServerSideUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = UserModel.verifyToken(token);
    if (!decoded) {
      return null;
    }

    const user = await UserModel.findById(decoded.userId);
    return user;
  } catch (error) {
    console.error('Error getting server side user:', error);
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest) {
  return request.cookies.get('auth-token')?.value || null;
}

export async function getUserFromToken(token: string) {
  try {
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