const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an OTP code to the user's email for password reset.
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - 6-digit OTP code
 */
const sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: `"EventMatrix" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your EventMatrix Password Reset Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 28px 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 22px; font-weight: 700;">EventMatrix</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">Password Reset Request</p>
        </div>
        <div style="padding: 32px 24px; background: #fff;">
          <p style="color: #334155; font-size: 15px; margin: 0 0 20px;">
            Hi there! You requested a password reset for your EventMatrix account. Use the code below to verify your identity:
          </p>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 20px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #6366f1;">${otpCode}</span>
          </div>
          <p style="color: #64748b; font-size: 13px; margin: 0 0 8px;">
            ⏱ This code is valid for <strong>5 minutes</strong>.
          </p>
          <p style="color: #64748b; font-size: 13px; margin: 0;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} EventMatrix. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
