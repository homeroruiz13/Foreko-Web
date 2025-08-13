// Simplified OAuth implementation for Next.js API routes
import { UserProviderModel } from './models/user-provider';
import { UserModel } from './models/user';
import crypto from 'crypto';

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name: string;
  provider: string;
}

export class OAuthHelper {
  private static getBaseUrl(): string {
    // Always use production domain for OAuth redirects
    if (process.env.NODE_ENV === 'production') {
      return 'https://www.foreko.app';
    }
    // For development, use local URL
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
  }

  private static configs: Record<string, OAuthProviderConfig> = {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: `${OAuthHelper.getBaseUrl()}/api/auth/oauth/google/callback`,
      scope: 'profile email',
      authUrl: 'https://accounts.google.com/oauth/authorize',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
    },
    microsoft: {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: `${OAuthHelper.getBaseUrl()}/api/auth/oauth/microsoft/callback`,
      scope: 'user.read',
      authUrl: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT || 'common'}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT || 'common'}/oauth2/v2.0/token`,
      userInfoUrl: 'https://graph.microsoft.com/v1.0/me'
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      redirectUri: `${OAuthHelper.getBaseUrl()}/api/auth/oauth/facebook/callback`,
      scope: 'email',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email'
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
      redirectUri: `${OAuthHelper.getBaseUrl()}/api/auth/oauth/apple/callback`,
      scope: 'name email',
      authUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
      userInfoUrl: ''
    }
  };

  static generateAuthUrl(provider: string, state?: string): string {
    const config = this.configs[provider];
    if (!config || !config.clientId) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', config.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', config.scope);
    
    if (state) {
      authUrl.searchParams.set('state', state);
    }

    // Provider-specific parameters
    if (provider === 'microsoft') {
      authUrl.searchParams.set('response_mode', 'query');
    } else if (provider === 'apple') {
      authUrl.searchParams.set('response_mode', 'form_post');
    }

    return authUrl.toString();
  }

  static async exchangeCodeForTokens(provider: string, code: string): Promise<{access_token: string, id_token?: string}> {
    const config = this.configs[provider];
    if (!config) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    let tokenParams: URLSearchParams;
    let headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    };

    if (provider === 'apple') {
      const clientSecret = this.generateAppleClientSecret();
      tokenParams = new URLSearchParams({
        client_id: config.clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      });
    } else {
      tokenParams = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code'
      });
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers,
      body: tokenParams
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Token exchange failed for ${provider}:`, errorText);
      throw new Error(`Failed to exchange code for token: ${response.status}`);
    }

    const tokenData = await response.json();
    return {
      access_token: tokenData.access_token,
      id_token: tokenData.id_token
    };
  }

  private static generateAppleClientSecret(): string {
    if (!process.env.APPLE_PRIVATE_KEY || !process.env.APPLE_KEY_ID || !process.env.APPLE_TEAM_ID) {
      throw new Error('Apple OAuth configuration incomplete');
    }

    try {
      const jwt = require('jsonwebtoken');
      const privateKey = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
      
      const payload = {
        iss: process.env.APPLE_TEAM_ID,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400 * 180, // 180 days
        aud: 'https://appleid.apple.com',
        sub: process.env.APPLE_CLIENT_ID,
      };

      return jwt.sign(payload, privateKey, {
        algorithm: 'ES256',
        header: {
          kid: process.env.APPLE_KEY_ID,
        },
      });
    } catch (error) {
      console.error('Apple client secret generation failed:', error);
      throw new Error('Failed to generate Apple client secret');
    }
  }

  static async getUserInfo(provider: string, accessToken: string, idToken?: string): Promise<OAuthUserInfo> {
    const config = this.configs[provider];
    if (!config) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    let userData: any;

    if (provider === 'apple') {
      if (!idToken) {
        throw new Error('Apple OAuth requires id_token');
      }
      
      try {
        const jwt = require('jsonwebtoken');
        userData = jwt.decode(idToken);
        if (!userData) {
          throw new Error('Failed to decode Apple ID token');
        }
      } catch (error) {
        console.error('Apple ID token decode failed:', error);
        throw new Error('Invalid Apple ID token');
      }
    } else {
      const response = await fetch(config.userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`User info fetch failed for ${provider}:`, errorText);
        throw new Error(`Failed to get user info: ${response.status}`);
      }

      userData = await response.json();
    }

    // Normalize user data across providers
    let userInfo: OAuthUserInfo;

    switch (provider) {
      case 'google':
        userInfo = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          provider: 'google'
        };
        break;
      case 'microsoft':
        userInfo = {
          id: userData.id,
          email: userData.mail || userData.userPrincipalName,
          name: userData.displayName,
          provider: 'microsoft'
        };
        break;
      case 'facebook':
        userInfo = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          provider: 'facebook'
        };
        break;
      case 'apple':
        userInfo = {
          id: userData.sub,
          email: userData.email,
          name: userData.email?.split('@')[0] || 'Apple User',
          provider: 'apple'
        };
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    if (!userInfo.email) {
      throw new Error(`No email provided by ${provider}`);
    }

    return userInfo;
  }

  static async handleOAuthCallback(provider: string, code: string, idToken?: string): Promise<any> {
    try {
      // Exchange code for access token
      const tokenResponse = await this.exchangeCodeForTokens(provider, code);
      
      // Get user info
      const userInfo = await this.getUserInfo(provider, tokenResponse.access_token, tokenResponse.id_token || idToken);
      
      // Check if user already exists with this provider
      const existingProvider = await UserProviderModel.findByProviderAndUid(
        provider as any,
        userInfo.id
      );

      if (existingProvider) {
        // Update tokens and return existing user
        await UserProviderModel.updateTokens(existingProvider.id, {
          access_token: tokenResponse.access_token,
          token_expires_at: new Date(Date.now() + 3600000) // 1 hour
        });
        
        const user = await UserModel.findById(existingProvider.user_id);
        return user;
      }

      // Check if user exists with this email
      let user = await UserModel.findByEmail(userInfo.email);
      
      if (!user) {
        // Create new user
        user = await UserModel.create({
          name: userInfo.name,
          email: userInfo.email,
          status: 'active', // OAuth users are automatically verified
          email_verified_at: new Date(),
        });
      }

      // Link OAuth provider to user
      await UserProviderModel.create({
        user_id: user.id,
        provider: provider as any,
        provider_uid: userInfo.id,
        access_token: tokenResponse.access_token,
        token_expires_at: new Date(Date.now() + 3600000), // 1 hour
      });

      // Update user status if they were pending
      if (user.status === 'pending') {
        await UserModel.updateEmailVerified(user.id);
      }

      return user;
    } catch (error) {
      console.error(`OAuth callback error for ${provider}:`, error);
      throw error;
    }
  }

  static generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static isProviderConfigured(provider: string): boolean {
    const config = this.configs[provider];
    return !!(config && config.clientId && config.clientSecret);
  }
}