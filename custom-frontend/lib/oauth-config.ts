import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as AppleStrategy } from 'passport-apple';
import { UserProviderModel } from './models/user-provider';
import { UserModel } from './models/user';

// OAuth configuration interface
interface OAuthProfile {
  id: string;
  emails?: Array<{ value: string; verified?: boolean }>;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  provider: string;
}

// Helper function to get base URL
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://www.foreko.app');
}

// Environment variables for OAuth providers
const config = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${getBaseUrl()}/api/auth/oauth/google/callback`,
  },
  microsoft: {
    clientID: process.env.MICROSOFT_CLIENT_ID!,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    callbackURL: `${getBaseUrl()}/api/auth/oauth/microsoft/callback`,
    tenant: process.env.MICROSOFT_TENANT || 'common',
  },
  facebook: {
    clientID: process.env.FACEBOOK_CLIENT_ID!,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    callbackURL: `${getBaseUrl()}/api/auth/oauth/facebook/callback`,
  },
  apple: {
    clientID: process.env.APPLE_CLIENT_ID!,
    teamID: process.env.APPLE_TEAM_ID!,
    keyID: process.env.APPLE_KEY_ID!,
    privateKeyString: process.env.APPLE_PRIVATE_KEY!,
    callbackURL: `${getBaseUrl()}/api/auth/oauth/apple/callback`,
  },
};

// Common OAuth user handler
async function handleOAuthUser(
  accessToken: string,
  refreshToken: string,
  profile: OAuthProfile,
  done: (error: any, user?: any) => void
) {
  try {
    const email = profile.emails?.[0]?.value;
    
    if (!email) {
      return done(new Error('No email provided by OAuth provider'), null);
    }

    // Check if user already exists with this provider
    const existingProvider = await UserProviderModel.findByProviderAndUid(
      profile.provider as any,
      profile.id
    );

    if (existingProvider) {
      // Update tokens and return existing user
      await UserProviderModel.updateTokens(existingProvider.id, {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: new Date(Date.now() + 3600000) // 1 hour
      });
      
      const user = await UserModel.findById(existingProvider.user_id);
      return done(null, user);
    }

    // Check if user exists with this email
    let user = await UserModel.findByEmail(email);
    
    if (!user) {
      // Create new user
      const name = profile.displayName || 
                   `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() ||
                   email.split('@')[0];
      
      user = await UserModel.create({
        name,
        email,
        status: 'active', // OAuth users are automatically verified
        email_verified_at: new Date(),
      });
    }

    // Link OAuth provider to user
    await UserProviderModel.create({
      user_id: user.id,
      provider: profile.provider as any,
      provider_uid: profile.id,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: new Date(Date.now() + 3600000), // 1 hour
    });

    // Update user status if they were pending
    if (user.status === 'pending') {
      await UserModel.updateEmailVerified(user.id);
    }

    return done(null, user);
  } catch (error) {
    console.error('OAuth user handler error:', error);
    return done(error, null);
  }
}

// Google OAuth Strategy
if (config.google.clientID && config.google.clientSecret) {
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL,
        scope: ['profile', 'email'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        await handleOAuthUser(accessToken, refreshToken, {
          ...profile,
          provider: 'google'
        }, done);
      }
    )
  );
}

// Microsoft OAuth Strategy
if (config.microsoft.clientID && config.microsoft.clientSecret) {
  passport.use(
    'microsoft',
    new MicrosoftStrategy(
      {
        clientID: config.microsoft.clientID,
        clientSecret: config.microsoft.clientSecret,
        callbackURL: config.microsoft.callbackURL,
        tenant: config.microsoft.tenant,
        scope: ['user.read'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        await handleOAuthUser(accessToken, refreshToken, {
          ...profile,
          provider: 'microsoft'
        }, done);
      }
    )
  );
}

// Facebook OAuth Strategy
if (config.facebook.clientID && config.facebook.clientSecret) {
  passport.use(
    'facebook',
    new FacebookStrategy(
      {
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: ['id', 'emails', 'name', 'displayName'],
      },
      async (accessToken: string, refreshToken: string, profile: any, done: any) => {
        await handleOAuthUser(accessToken, refreshToken, {
          ...profile,
          provider: 'facebook'
        }, done);
      }
    )
  );
}

// Apple OAuth Strategy
if (config.apple.clientID && config.apple.teamID && config.apple.keyID && config.apple.privateKeyString) {
  passport.use(
    'apple',
    new AppleStrategy(
      {
        clientID: config.apple.clientID,
        teamID: config.apple.teamID,
        keyID: config.apple.keyID,
        privateKeyString: config.apple.privateKeyString,
        callbackURL: config.apple.callbackURL,
        scope: ['email', 'name'],
        passReqToCallback: false,
      },
      async (accessToken: string, refreshToken: string, idToken: string, profile: any, done: any) => {
        await handleOAuthUser(accessToken, refreshToken, {
          ...profile,
          provider: 'apple'
        }, done);
      }
    )
  );
}

// Passport serialization (for session support)
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export { passport, config };