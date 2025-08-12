import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSessionToken, getSessionTokenFromRequest, revokeUserSession, revokeAllUserSessions } from '@/lib/auth-session';
import { UserSessionModel } from '@/lib/models/user-session';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = getSessionTokenFromRequest(request);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const user = await getUserFromSessionToken(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get all sessions for the user
    const sessions = await UserSessionModel.findByUserId(user.id);
    
    // Format session data (remove sensitive token info)
    const sessionData = sessions
      .filter(session => new Date() <= session.expires_at) // Only active sessions
      .map(session => ({
        id: session.id,
        ip_address: session.ip_address,
        user_agent: session.user_agent,
        created_at: session.created_at,
        updated_at: session.updated_at,
        expires_at: session.expires_at,
        is_current: session.session_token === sessionToken
      }));

    return NextResponse.json(
      { sessions: sessionData },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = getSessionTokenFromRequest(request);
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      );
    }

    const user = await getUserFromSessionToken(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const revokeAll = searchParams.get('all') === 'true';

    if (revokeAll) {
      // Revoke all sessions except the current one
      const sessions = await UserSessionModel.findByUserId(user.id);
      const promises = sessions
        .filter(session => session.session_token !== sessionToken)
        .map(session => UserSessionModel.deleteSession(session.session_token));
      
      await Promise.all(promises);

      return NextResponse.json(
        { message: 'All other sessions revoked successfully' },
        { status: 200 }
      );
    }

    if (sessionId) {
      // Revoke specific session
      const sessions = await UserSessionModel.findByUserId(user.id);
      const targetSession = sessions.find(session => session.id === sessionId);

      if (!targetSession) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      await UserSessionModel.deleteSession(targetSession.session_token);

      return NextResponse.json(
        { message: 'Session revoked successfully' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: 'Session ID required or use ?all=true to revoke all other sessions' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}