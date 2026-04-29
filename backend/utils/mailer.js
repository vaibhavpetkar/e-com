import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send email verification link to new user
 */
export const sendVerificationEmail = async (to, token) => {
    const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    await transporter.sendMail({
        from: `"ProfitPulse" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Verify Your Email — ProfitPulse",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
          <div style="background:#1a1d21;padding:28px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">ProfitPulse</h1>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="color:#1a1d21;margin-top:0;">Verify Your Email Address</h2>
            <p style="color:#555;line-height:1.7;">Thank you for registering! Please click the button below to verify your email address and activate your account.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${link}" style="background:#1a1d21;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Verify Email</a>
            </div>
            <p style="color:#aaa;font-size:13px;">This link expires in <strong>24 hours</strong>. If you did not register, please ignore this email.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#bbb;font-size:12px;">Or copy this link: <a href="${link}" style="color:#1a1d21;">${link}</a></p>
          </div>
        </div>
        `,
    });
};

/**
 * Send OTP for password reset
 */
export const sendOtpEmail = async (to, otp) => {
    await transporter.sendMail({
        from: `"ProfitPulse" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Your Password Reset OTP — ProfitPulse",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
          <div style="background:#1a1d21;padding:28px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">ProfitPulse</h1>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="color:#1a1d21;margin-top:0;">Password Reset OTP</h2>
            <p style="color:#555;line-height:1.7;">You requested a password reset. Use the OTP below to continue. It is valid for <strong>5 minutes</strong>.</p>
            <div style="text-align:center;margin:32px 0;">
              <div style="display:inline-block;background:#1a1d21;color:#fff;padding:18px 48px;border-radius:12px;font-size:36px;font-weight:bold;letter-spacing:10px;">${otp}</div>
            </div>
            <p style="color:#aaa;font-size:13px;">If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
        </div>
        `,
    });
};
