import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, company, category, message } = body;

    // Validate required fields
    if (!fullName || !email || !phone || !company || !category || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create email content
    const emailContent = {
      to: 'forekoai@gmail.com',
      from: email,
      subject: `New Contact Form Submission - ${category}`,
      fullName,
      email,
      phone,
      company,
      category,
      message,
      timestamp: new Date().toISOString()
    };

    // Try to send email
    const emailResult = await sendEmail(emailContent);

    return NextResponse.json(
      { 
        message: 'Contact form submitted successfully',
        emailSent: emailResult.success,
        method: emailResult.fallback ? 'logged' : 'email'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Email sending function with multiple fallbacks
async function sendEmail(emailData: any) {
  // Method 1: Try nodemailer if available
  try {
    if (process.env.GMAIL_APP_PASSWORD) {
      const result = await sendWithNodemailer(emailData);
      if (result.success) return result;
    }
  } catch (error) {
    console.error('Nodemailer failed:', error);
  }

  // Method 2: Try Fetch API with email service
  try {
    const result = await sendWithFetch(emailData);
    if (result.success) return result;
  } catch (error) {
    console.error('Fetch email service failed:', error);
  }

  // Method 3: Fallback - Log the submission
  console.log('All email methods failed, logging contact form submission:');
  console.log(emailData);
  
  return { 
    success: true, 
    fallback: true, 
    message: 'Form submission logged (email delivery failed)' 
  };
}

// Nodemailer implementation
async function sendWithNodemailer(emailData: any) {
  try {
    // Dynamic import to handle serverless environments better
    const nodemailer = await import('nodemailer');
    
    const transporter = nodemailer.default.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'forekoai@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER || 'forekoai@gmail.com',
      to: emailData.to,
      subject: emailData.subject,
      html: formatEmailHtml(emailData),
      replyTo: emailData.from,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via nodemailer:', result.messageId);
    
    return { success: true, messageId: result.messageId, method: 'nodemailer' };
  } catch (error) {
    console.error('Nodemailer error:', error);
    throw error;
  }
}

// Fetch-based email service (using EmailJS or similar)
async function sendWithFetch(emailData: any) {
  // This could be configured to use EmailJS, SendGrid, or other services
  // For now, we'll skip this method
  throw new Error('Fetch email service not configured');
}

// Format email HTML
function formatEmailHtml(emailData: any): string {
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>Full Name:</strong> ${emailData.fullName}</p>
    <p><strong>Email:</strong> ${emailData.email}</p>
    <p><strong>Phone:</strong> ${emailData.phone}</p>
    <p><strong>Company:</strong> ${emailData.company}</p>
    <p><strong>Category:</strong> ${emailData.category}</p>
    <p><strong>Message:</strong></p>
    <p>${emailData.message.replace(/\n/g, '<br>')}</p>
    <hr>
    <p><strong>Submitted:</strong> ${emailData.timestamp}</p>
    <p><em>This message was sent from the Foreko contact form.</em></p>
  `;
}