import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string, link: string) {
  try {
    await resend.emails.send({
      from: 'QA System <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a365d; font-size: 24px; margin-bottom: 10px;">Welcome to Super QA!</h1>
            <p style="color: #4a5568; font-size: 16px;">Please verify your email address to complete your registration.</p>
          </div>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 6px; text-align: center; margin-bottom: 30px;">
            <p style="color: #4a5568; font-size: 14px; margin-bottom: 10px;">Your verification code is:</p>
            <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; display: inline-block; border: 2px solid #e2e8f0;">
              <span style="color: #2d3748; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #718096; font-size: 12px; margin-top: 10px;">This code will expire in 10 minutes</p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${link}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">Verify Email Address</a>
          </div>

          <div style="text-align: center; color: #718096; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            <p style="margin: 0;">If you didn't create an account with Super QA, please ignore this email.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
} 