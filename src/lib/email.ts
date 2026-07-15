import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(toEmail: string, otp: string, userName: string) {
  const mailOptions = {
    from: `"Inotech Solutions" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Verification Code for Password Reset - Inotech Solutions',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #E26321; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">INOTECH SOLUTIONS</h2>
          <p style="color: #737373; font-size: 14px; margin: 4px 0 0 0;">Internship Portal</p>
        </div>
        
        <div style="border-top: 1px solid #f5f5f5; padding-top: 24px;">
          <p style="font-size: 16px; color: #171717; margin: 0 0 16px 0;">Hello ${userName},</p>
          <p style="font-size: 14px; color: #737373; line-height: 1.5; margin: 0 0 24px 0;">
            We received a request to reset your password. Use the verification code (OTP) below to set a new password. This code will expire in 15 minutes.
          </p>
          
          <div style="text-align: center; background-color: #fdf0e9; border: 1px dashed #E26321; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; color: #E26321; letter-spacing: 6px; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: #a1a1aa; line-height: 1.5; margin: 0;">
            If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <div style="margin-top: 32px; border-top: 1px solid #f5f5f5; padding-top: 16px; text-align: center;">
          <p style="font-size: 11px; color: #a1a1aa; margin: 0;">&copy; 2020 Inotech Solutions (Pvt) Ltd. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendRegistrationOtpEmail(toEmail: string, otp: string) {
  const mailOptions = {
    from: `"Inotech Solutions" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Email Verification',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #E26321; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">INOTECH SOLUTIONS</h2>
          <p style="color: #737373; font-size: 14px; margin: 4px 0 0 0;">Internship Portal</p>
        </div>
        
        <div style="border-top: 1px solid #f5f5f5; padding-top: 24px;">
          <p style="font-size: 16px; color: #171717; margin: 0 0 16px 0;">Hello,</p>
          <p style="font-size: 14px; color: #737373; line-height: 1.5; margin: 0 0 24px 0;">
            Your verification code is <strong>${otp}</strong>. It expires in 5 minutes.
          </p>
          
          <div style="text-align: center; background-color: #fdf0e9; border: 1px dashed #E26321; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 800; color: #E26321; letter-spacing: 6px; font-family: monospace;">${otp}</span>
          </div>
          
          <p style="font-size: 12px; color: #a1a1aa; line-height: 1.5; margin: 0;">
            If you did not request this verification code, you can safely ignore this email.
          </p>
        </div>
        
        <div style="margin-top: 32px; border-top: 1px solid #f5f5f5; padding-top: 16px; text-align: center;">
          <p style="font-size: 11px; color: #a1a1aa; margin: 0;">&copy; 2026 Inotech Solutions (Pvt) Ltd. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

