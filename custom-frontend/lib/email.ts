import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  private initializeTransporter(): nodemailer.Transporter {
    if (this.transporter) {
      return this.transporter;
    }

    // Validate required environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.error('Missing required SMTP environment variables:', {
        SMTP_HOST: !!smtpHost,
        SMTP_USER: !!smtpUser,
        SMTP_PASSWORD: !!smtpPassword,
      });
      throw new Error('SMTP configuration is incomplete. Please check environment variables.');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    return this.transporter;
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Initialize transporter only when needed
      const transporter = this.initializeTransporter();
      
      // Validate from address
      const fromAddress = process.env.EMAIL_FROM_ADDRESS;
      if (!fromAddress) {
        throw new Error('EMAIL_FROM_ADDRESS environment variable is required');
      }

      console.log('Attempting to send email:', {
        to: options.to,
        subject: options.subject,
        from: fromAddress,
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT,
      });

      const info = await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Foreko'}" <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      console.error('SMTP Configuration:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? '***SET***' : 'NOT SET',
        password: process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET',
        fromAddress: process.env.EMAIL_FROM_ADDRESS ? '***SET***' : 'NOT SET',
      });
      return false;
    }
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Foreko</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Foreko!</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Thank you for signing up for Foreko. To complete your registration and start using your account, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              If you can't click the button above, copy and paste this link into your browser:
              <br>
              <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              This verification link will expire in 24 hours. If you didn't create an account with us, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Foreko. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Hi ${name}!
      
      Thank you for signing up for Foreko. To complete your registration, please verify your email address by visiting this link:
      
      ${verificationUrl}
      
      This verification link will expire in 24 hours. If you didn't create an account with us, you can safely ignore this email.
      
      © ${new Date().getFullYear()} Foreko. All rights reserved.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Foreko',
      html,
      text,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/en/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password - Foreko</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              We received a request to reset your password for your Foreko account. Click the button below to create a new password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        text-decoration: none; 
                        padding: 15px 30px; 
                        border-radius: 5px; 
                        font-weight: bold; 
                        font-size: 16px; 
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              If you can't click the button above, copy and paste this link into your browser:
              <br>
              <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 25px;">
              This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Foreko. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
      Hi ${name}!
      
      We received a request to reset your password for your Foreko account. Visit this link to create a new password:
      
      ${resetUrl}
      
      This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
      
      © ${new Date().getFullYear()} Foreko. All rights reserved.
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Foreko',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();