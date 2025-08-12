# Authentication System Documentation

This document outlines the three authentication systems implemented in the Foreko application:

1. **Email Verification System**
2. **Password Reset System**  
3. **User Session Management System**

## Overview

The authentication system uses a hybrid approach with both JWT tokens (for backward compatibility) and session-based authentication (primary method). All sensitive operations are secured with database-backed tokens and proper cleanup mechanisms.

## 1. Email Verification System

### Features
- Secure token generation using crypto.randomBytes(32)
- 24-hour token expiration
- Automatic cleanup of expired tokens
- HTML email templates with branded styling
- Fallback text emails for accessibility

### API Endpoints

#### Send Verification Email (Automatic)
- **Trigger**: Automatically sent during user signup
- **Endpoint**: `/api/auth/signup` (POST)
- **Email Template**: Branded HTML with verification link

#### Verify Email
- **Endpoint**: `/api/auth/verify-email` (POST/GET)  
- **Body**: `{ "token": "verification_token" }`
- **Response**: User object + JWT/Session tokens
- **Action**: Activates user account, sets email_verified_at

#### Resend Verification
- **Endpoint**: `/api/auth/resend-verification` (POST)
- **Body**: `{ "email": "user@example.com" }`
- **Response**: Success message (prevents email enumeration)

### Database Schema
```sql
CREATE TABLE email_verifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 2. Password Reset System

### Features
- Secure token generation using crypto.randomBytes(32)
- 1-hour token expiration (shorter for security)
- Single-use tokens with automatic invalidation
- Email enumeration protection
- Automatic cleanup of expired tokens

### API Endpoints

#### Request Password Reset
- **Endpoint**: `/api/auth/forgot-password` (POST)
- **Body**: `{ "email": "user@example.com" }`
- **Response**: Always success message (security)
- **Email**: Branded HTML template with reset link

#### Reset Password
- **Endpoint**: `/api/auth/reset-password` (POST)
- **Body**: `{ "token": "reset_token", "password": "new_password", "confirmPassword": "new_password" }`
- **Validation**: Password length, confirmation match
- **Action**: Updates password, invalidates all reset tokens

#### Validate Reset Token
- **Endpoint**: `/api/auth/reset-password` (GET)
- **Query**: `?token=reset_token`
- **Response**: Token validity status

### Database Schema
```sql
CREATE TABLE password_resets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_used         BOOLEAN NOT NULL DEFAULT FALSE,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## 3. User Session Management System

### Features
- Session-based authentication with 30-day expiration
- IP address and User-Agent tracking
- Session activity monitoring (updated_at)
- Multiple active session support
- Selective session revocation
- Automatic cleanup of expired sessions

### API Endpoints

#### Get User Sessions
- **Endpoint**: `/api/auth/sessions` (GET)
- **Authentication**: Required (session token)
- **Response**: Array of active sessions with metadata

#### Revoke Sessions
- **Endpoint**: `/api/auth/sessions` (DELETE)
- **Query Parameters**:
  - `?sessionId=uuid` - Revoke specific session
  - `?all=true` - Revoke all other sessions (keep current)

### Database Schema
```sql
CREATE TABLE user_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token   VARCHAR(255) NOT NULL,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Authentication Flow

### Sign Up Flow
1. User submits registration form
2. System creates user with 'pending' status
3. Email verification token generated
4. Branded verification email sent
5. User clicks link or submits token
6. Account activated, user signed in with session

### Sign In Flow  
1. User submits credentials
2. System validates email/password
3. Checks user status (pending/active/suspended)
4. Creates new session with IP/User-Agent tracking
5. Sets both JWT (legacy) and session cookies
6. Returns user data + session info

### Password Reset Flow
1. User requests reset with email
2. System finds user, generates reset token
3. Reset email sent (always success response)
4. User clicks link, validates token
5. User submits new password
6. Password updated, all reset tokens invalidated

## Security Features

### Token Security
- Cryptographically secure random token generation
- Short expiration times (1 hour for resets, 24 hours for verification)
- Single-use tokens with automatic invalidation
- Secure token comparison to prevent timing attacks

### Email Security
- No email enumeration attacks (always return success)
- Branded templates reduce phishing risk
- Secure HTTPS links only
- Clear token expiration communication

### Session Security
- HttpOnly cookies prevent XSS attacks
- Secure flag for production environments
- SameSite protection against CSRF
- IP and User-Agent tracking for anomaly detection
- Selective session revocation capabilities

## Environment Configuration

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/foreko_db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM_NAME=Foreko
EMAIL_FROM_ADDRESS=your-email@gmail.com

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Cleanup API token (for scheduled cleanup)
CLEANUP_API_TOKEN=your-cleanup-api-token-here
```

## Maintenance

### Cleanup Service
The system includes automatic cleanup of expired tokens and sessions:

- **Endpoint**: `/api/auth/cleanup` (POST)
- **Authentication**: Bearer token (CLEANUP_API_TOKEN)
- **Schedule**: Can be run via cron job every 24 hours
- **Actions**: Removes expired verifications, resets, and sessions

### Monitoring
Track the following metrics:
- Failed verification attempts
- Password reset request frequency  
- Active session counts per user
- Token cleanup frequency

## Migration from JWT-only

The system maintains backward compatibility:
- Existing JWT tokens continue to work
- New logins create both JWT and session tokens
- Session tokens take precedence when both exist
- Gradual migration as users re-authenticate

## Error Handling

All endpoints return consistent error formats:
```json
{
  "error": "Error message",
  "details": "Optional additional details"
}
```

Common error codes:
- `400`: Invalid input or expired tokens
- `401`: Authentication required
- `403`: Access denied (suspended account, unverified email)
- `404`: Resource not found
- `500`: Internal server error

## Development Notes

### File Structure
```
lib/
├── models/
│   ├── email-verification.ts
│   ├── password-reset.ts
│   └── user-session.ts
├── auth.ts (updated with session support)
├── auth-session.ts (session management utilities)
├── email.ts (email service)
└── cleanup.ts (maintenance utilities)

app/api/auth/
├── signup/route.ts (updated)
├── signin/route.ts (updated)
├── logout/route.ts (updated)
├── verify-email/route.ts
├── resend-verification/route.ts
├── forgot-password/route.ts
├── reset-password/route.ts
├── sessions/route.ts
└── cleanup/route.ts
```

### Testing Recommendations
1. Test email delivery in development environment
2. Verify token expiration behavior
3. Test session management across multiple devices
4. Validate cleanup processes
5. Test error scenarios (expired tokens, invalid inputs)
6. Verify security headers and cookie settings

### Dependencies Added
- `nodemailer`: Email sending functionality
- `@types/nodemailer`: TypeScript definitions

The system is now ready for production use with proper security measures, monitoring, and maintenance capabilities.