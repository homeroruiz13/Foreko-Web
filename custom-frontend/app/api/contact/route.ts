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
      email: email, // Add the sender email for replyTo
      subject: `New Contact Form Submission - ${category}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was sent from the Foreko contact form.</em></p>
      `,
    };

    // Send email using a service (you'll need to implement this based on your email service)
    // For now, we'll use a simple approach with nodemailer or a similar service
    await sendEmail(emailContent);

    return NextResponse.json(
      { message: 'Contact form submitted successfully' },
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

// Email sending function using nodemailer
async function sendEmail(emailData: any) {
  try {
    const nodemailer = require('nodemailer');
    
    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'forekoai@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // Use App Password, not regular password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.GMAIL_USER || 'forekoai@gmail.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      replyTo: emailData.email, // Allow replies to go to the form submitter
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Fallback: Log the form submission for manual processing
    console.log('Contact form submission (email failed):', {
      ...emailData,
      timestamp: new Date().toISOString()
    });
    
    // For now, we'll still return success to not break user experience
    // You could implement database logging here as backup
    return { success: true, fallback: true };
  }
}