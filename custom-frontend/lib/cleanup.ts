import { EmailVerificationModel } from './models/email-verification';
import { PasswordResetModel } from './models/password-reset';
import { UserSessionModel } from './models/user-session';

export class AuthCleanupService {
  static async cleanupExpiredTokens() {
    try {
      console.log('Starting auth cleanup...');
      
      // Clean up expired email verifications
      await EmailVerificationModel.cleanupExpired();
      console.log('Cleaned up expired email verifications');
      
      // Clean up expired password resets
      await PasswordResetModel.cleanupExpired();
      console.log('Cleaned up expired password resets');
      
      // Clean up expired sessions
      await UserSessionModel.deleteExpiredSessions();
      console.log('Cleaned up expired user sessions');
      
      console.log('Auth cleanup completed successfully');
      return { success: true };
    } catch (error) {
      console.error('Auth cleanup failed:', error);
      return { success: false, error };
    }
  }

  static async scheduleCleanup() {
    // Run cleanup every 24 hours
    const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    const runCleanup = async () => {
      await this.cleanupExpiredTokens();
      setTimeout(runCleanup, CLEANUP_INTERVAL);
    };
    
    // Start the first cleanup after 1 minute
    setTimeout(runCleanup, 60 * 1000);
    console.log('Scheduled auth cleanup to run every 24 hours');
  }

  static async cleanupUserData(userId: string) {
    try {
      console.log(`Cleaning up data for user: ${userId}`);
      
      // Delete all user sessions
      await UserSessionModel.deleteAllUserSessions(userId);
      console.log('Deleted all user sessions');
      
      // Invalidate all password reset tokens for user
      await PasswordResetModel.invalidateAllForUser(userId);
      console.log('Invalidated all password reset tokens');
      
      console.log(`Cleanup completed for user: ${userId}`);
      return { success: true };
    } catch (error) {
      console.error(`Cleanup failed for user ${userId}:`, error);
      return { success: false, error };
    }
  }
}

// API endpoint for manual cleanup
export async function runManualCleanup() {
  return await AuthCleanupService.cleanupExpiredTokens();
}