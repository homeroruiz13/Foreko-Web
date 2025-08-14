import { NextRequest } from 'next/server';
import { OrganizationService } from './org-service';
import { getServerSideUserWithSession } from './auth-session';

export interface AuditContext {
  companyId: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValues?: any;
  newValues?: any;
  request?: NextRequest;
}

export class AuditLogger {
  static async log(context: AuditContext): Promise<void> {
    try {
      const user = await getServerSideUserWithSession();
      
      const ipAddress = context.request ? this.getClientIP(context.request) : undefined;
      const userAgent = context.request?.headers.get('user-agent') || undefined;

      await OrganizationService.logAuditEvent({
        company_id: context.companyId,
        user_id: user?.id,
        action: context.action,
        resource_type: context.resourceType,
        resource_id: context.resourceId,
        old_values: context.oldValues,
        new_values: context.newValues,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw - audit failures shouldn't break the main operation
    }
  }

  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return request.ip || 'unknown';
  }

  // Helper methods for common audit actions
  static async logCompanyAction(companyId: string, action: string, newValues?: any, oldValues?: any, request?: NextRequest): Promise<void> {
    await this.log({
      companyId,
      action,
      resourceType: 'company',
      resourceId: companyId,
      oldValues,
      newValues,
      request
    });
  }

  static async logMemberAction(companyId: string, action: string, memberId: string, newValues?: any, oldValues?: any, request?: NextRequest): Promise<void> {
    await this.log({
      companyId,
      action,
      resourceType: 'member',
      resourceId: memberId,
      oldValues,
      newValues,
      request
    });
  }

  static async logInvitationAction(companyId: string, action: string, invitationId: string, newValues?: any, request?: NextRequest): Promise<void> {
    await this.log({
      companyId,
      action,
      resourceType: 'invitation',
      resourceId: invitationId,
      newValues,
      request
    });
  }

  static async logSettingAction(companyId: string, action: string, settingKey: string, newValues?: any, oldValues?: any, request?: NextRequest): Promise<void> {
    await this.log({
      companyId,
      action,
      resourceType: 'setting',
      resourceId: settingKey,
      oldValues,
      newValues,
      request
    });
  }

  static async logGenericAction(companyId: string, action: string, resourceType?: string, resourceId?: string, data?: any, request?: NextRequest): Promise<void> {
    await this.log({
      companyId,
      action,
      resourceType,
      resourceId,
      newValues: data,
      request
    });
  }
}

// Common audit action constants
export const AuditActions = {
  // Company actions
  COMPANY_CREATED: 'company_created',
  COMPANY_UPDATED: 'company_updated',
  COMPANY_DELETED: 'company_deleted',
  
  // Member actions
  MEMBER_INVITED: 'member_invited',
  MEMBER_JOINED: 'member_joined',
  MEMBER_REMOVED: 'member_removed',
  MEMBER_ROLE_UPDATED: 'member_role_updated',
  
  // Invitation actions
  INVITATION_CREATED: 'invitation_created',
  INVITATION_ACCEPTED: 'invitation_accepted',
  INVITATION_CANCELLED: 'invitation_cancelled',
  INVITATION_EXPIRED: 'invitation_expired',
  
  // Settings actions
  SETTING_CREATED: 'setting_created',
  SETTING_UPDATED: 'setting_updated',
  SETTING_DELETED: 'setting_deleted',
  
  // Authentication actions
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Data actions
  DATA_EXPORTED: 'data_exported',
  DATA_IMPORTED: 'data_imported',
  
  // Security actions
  PASSWORD_CHANGED: 'password_changed',
  TWO_FA_ENABLED: 'two_fa_enabled',
  TWO_FA_DISABLED: 'two_fa_disabled',
  
  // API actions
  API_KEY_CREATED: 'api_key_created',
  API_KEY_REVOKED: 'api_key_revoked'
} as const;

export type AuditAction = typeof AuditActions[keyof typeof AuditActions];