# OAuth Provider Setup Guide

This guide walks you through setting up OAuth authentication with Google, Microsoft, Facebook, and Apple for your Foreko application.

## Prerequisites

1. Your database schema is already set up with the `auth.user_providers` table
2. Your application is deployed and accessible (for redirect URLs)
3. You have the necessary environment variables configured

## Provider Setup

### 1. Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/oauth/google/callback` (development)
   - `https://yourdomain.com/api/auth/oauth/google/callback` (production)
7. Copy the Client ID and Client Secret

**Environment Variables:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Microsoft OAuth Setup

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Set redirect URI as:
   - `http://localhost:3000/api/auth/oauth/microsoft/callback` (development)
   - `https://yourdomain.com/api/auth/oauth/microsoft/callback` (production)
5. After registration, go to "Certificates & secrets" → "New client secret"
6. Copy the Application (client) ID and the client secret value

**Environment Variables:**
```env
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT=common
```

### 3. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product
4. In Facebook Login settings, add Valid OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/oauth/facebook/callback` (development)
   - `https://yourdomain.com/api/auth/oauth/facebook/callback` (production)
5. Copy the App ID and App Secret from App Settings → Basic

**Environment Variables:**
```env
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
```

### 4. Apple Sign In Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create a new App ID or modify an existing one
3. Enable "Sign In with Apple" capability
4. Create a Services ID:
   - Configure it for "Sign In with Apple"
   - Add return URLs:
     - `http://localhost:3000/api/auth/oauth/apple/callback` (development)
     - `https://yourdomain.com/api/auth/oauth/apple/callback` (production)
5. Create a private key for Sign In with Apple
6. Download the .p8 private key file

**Environment Variables:**
```env
APPLE_CLIENT_ID=your-apple-service-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----"
```

## Configuration

### 1. Update Environment Variables

Add all the OAuth credentials to your `.env.local` file:

```env
# OAuth Provider Configuration

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_TENANT=common

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Apple OAuth (Sign in with Apple)
APPLE_CLIENT_ID=your-apple-service-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT\n-----END PRIVATE KEY-----"
```

### 2. Initialize OAuth Configuration

The OAuth configuration is automatically loaded when your app starts. Make sure to import the configuration in your app:

```typescript
// In your app initialization or API routes
import '../lib/oauth-config';
```

## Testing OAuth Integration

### 1. Test Each Provider

1. Start your development server: `npm run dev`
2. Navigate to your login page
3. Click each OAuth provider button
4. Complete the OAuth flow
5. Verify that:
   - User is created in the database
   - Provider information is stored in `auth.user_providers`
   - User is logged in with session

### 2. Test User Linking

1. Create a user with email/password
2. Try to login with OAuth using the same email
3. Verify that the OAuth provider is linked to the existing user

## Production Deployment

### 1. Update Redirect URLs

Make sure all OAuth providers have the correct production URLs configured.

### 2. Environment Variables

Ensure all environment variables are set in your production environment.

### 3. HTTPS Requirements

Most OAuth providers require HTTPS in production. Make sure your application is served over HTTPS.

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check that redirect URIs match exactly in provider settings
   - Ensure protocol (http/https) matches

2. **"Invalid client credentials"**
   - Verify Client ID and Client Secret are correct
   - Check that credentials are for the correct environment

3. **"User cancelled the dialog"**
   - Normal behavior when user cancels OAuth flow
   - Handle gracefully in your UI

4. **Apple-specific issues**
   - Ensure private key format is correct (including newlines)
   - Verify Team ID and Key ID match Apple Developer Portal

### Debug Mode

Add debug logging to troubleshoot OAuth issues:

```typescript
// In oauth-config.ts, add:
console.log('OAuth Config:', {
  google: !!config.google.clientID,
  microsoft: !!config.microsoft.clientID,
  facebook: !!config.facebook.clientID,
  apple: !!config.apple.clientID,
});
```

## Security Considerations

1. **Never expose client secrets** in frontend code
2. **Use HTTPS** in production
3. **Validate redirect URIs** to prevent authorization code interception
4. **Implement proper session management** after OAuth completion
5. **Handle OAuth errors gracefully** to prevent information disclosure

## User Experience

### 1. Account Linking

Users can link multiple OAuth providers to the same account. The system will:
- Check if a user exists with the OAuth email
- Link the provider to the existing user if found
- Create a new user if no existing user is found

### 2. Error Handling

The system handles various OAuth scenarios:
- User cancellation: Redirect to login with appropriate message
- Provider errors: Display generic error message
- Network issues: Show retry option

### 3. Session Management

After successful OAuth authentication:
- User session is created with IP and User-Agent tracking
- Both session token and JWT are set for compatibility
- User is redirected to dashboard

## Database Schema

The OAuth integration uses these tables:

```sql
-- Users table (existing)
auth.users (
  id UUID PRIMARY KEY,
  name VARCHAR(150),
  email VARCHAR(255) UNIQUE,
  status user_status DEFAULT 'active',
  email_verified_at TIMESTAMPTZ,
  -- ... other fields
);

-- OAuth providers table (existing)
auth.user_providers (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  provider oauth_provider,
  provider_uid VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  -- ... timestamps
);
```

## API Endpoints

The OAuth integration adds these endpoints:

- `GET /api/auth/oauth/google` - Initiate Google OAuth
- `GET /api/auth/oauth/google/callback` - Google OAuth callback
- `GET /api/auth/oauth/microsoft` - Initiate Microsoft OAuth
- `GET /api/auth/oauth/microsoft/callback` - Microsoft OAuth callback
- `GET /api/auth/oauth/facebook` - Initiate Facebook OAuth
- `GET /api/auth/oauth/facebook/callback` - Facebook OAuth callback
- `GET /api/auth/oauth/apple` - Initiate Apple OAuth
- `GET|POST /api/auth/oauth/apple/callback` - Apple OAuth callback

Your OAuth integration is now complete and ready for production use!