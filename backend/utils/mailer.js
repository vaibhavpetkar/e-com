import nodemailer from "nodemailer";
import { pool } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

/**
 * Dynamically create transporter based on DB settings or .env fallback
 */
const getMailConfig = async () => {
    const res = await pool.query("SELECT key, value FROM app_settings WHERE key LIKE 'smtp_%' OR key = 'app_domain'");
    const settings = {};
    res.rows.forEach(row => { settings[row.key] = row.value; });

    const config = {
        host: settings.smtp_host || process.env.SMTP_HOST,
        port: parseInt(settings.smtp_port || process.env.SMTP_PORT || "587"),
        secure: (settings.smtp_port === "465"),
        auth: {
            user: settings.smtp_user || process.env.EMAIL_USER,
            pass: settings.smtp_pass || process.env.EMAIL_PASS,
        },
        from: settings.smtp_from || process.env.EMAIL_USER,
        domain: settings.app_domain || process.env.FRONTEND_URL || "http://localhost:5173"
    };

    // If using Gmail as fallback and no host provided
    if (!config.host && process.env.EMAIL_USER?.includes("gmail")) {
        config.service = "gmail";
    }

    return config;
};

const createTransporter = async (config) => {
    const transportOptions = config.service ? { service: config.service, auth: config.auth } : {
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth
    };
    return nodemailer.createTransport(transportOptions);
};

/**
 * Send email verification link to new user
 */
export const sendVerificationEmail = async (to, token) => {
    const config = await getMailConfig();
    const transporter = await createTransporter(config);
    const link = `${config.domain}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"ProfitPulse" <${config.from}>`,
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
 * Send invitation email to new user added by admin
 */
export const sendInvitationEmail = async (to, password, token, username) => {
    const config = await getMailConfig();
    const transporter = await createTransporter(config);
    const link = `${config.domain}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"ProfitPulse" <${config.from}>`,
        to,
        subject: "Welcome to ProfitPulse — Your Account is Ready",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#f9f9f9;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:#1a1d21;padding:28px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">ProfitPulse</h1>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="color:#1a1d21;margin-top:0;">Welcome, ${username}!</h2>
            <p style="color:#555;line-height:1.7;">An account has been created for you on <strong>ProfitPulse</strong>. Below are your temporary login details:</p>
            
            <div style="background:#fff;padding:20px;border-radius:8px;margin:24px 0;border:1px dashed #cbd5e1;">
              <p style="margin:0 0 10px 0;color:#64748b;font-size:14px;"><strong>Email:</strong> ${to}</p>
              <p style="margin:0;color:#64748b;font-size:14px;"><strong>Temporary Password:</strong> <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;color:#1a1d21;">${password}</code></p>
            </div>

            <p style="color:#555;line-height:1.7;">Please click the button below to verify your email and activate your account. You will be prompted to change your password after logging in.</p>
            
            <div style="text-align:center;margin:32px 0;">
              <a href="${link}" style="background:#22c55e;color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">Verify & Activate Account</a>
            </div>
            
            <p style="color:#aaa;font-size:13px;">If the button doesn't work, copy this link: <br/> <a href="${link}" style="color:#1a1d21;">${link}</a></p>
            
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
            <p style="color:#bbb;font-size:12px;text-align:center;">ProfitPulse Dashboard &bull; ${config.domain}</p>
          </div>
        </div>
        `,
    });
};

/**
 * Send OTP for password reset
 */
export const sendOtpEmail = async (to, otp) => {
    const config = await getMailConfig();
    const transporter = await createTransporter(config);

    await transporter.sendMail({
        from: `"ProfitPulse" <${config.from}>`,
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

/**
 * Send OTP for email verification during signup
 */
export const sendSignupOtpEmail = async (to, otp) => {
    const config = await getMailConfig();
    const transporter = await createTransporter(config);

    await transporter.sendMail({
        from: `"ProfitPulse" <${config.from}>`,
        to,
        subject: "Verify Your Email — ProfitPulse",
        html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);padding:28px 32px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">ProfitPulse</h1>
            <p style="color:#e0e7ff;margin:8px 0 0 0;font-size:14px;">Welcome!</p>
          </div>
          <div style="padding:36px 32px;">
            <h2 style="color:#1a1d21;margin-top:0;font-size:22px;">Verify Your Email Address</h2>
            <p style="color:#555;line-height:1.7;margin-bottom:24px;">Thank you for signing up! Please use the code below to verify your email address and complete your registration.</p>
            
            <div style="text-align:center;margin:32px 0;">
              <p style="color:#64748b;font-size:14px;margin:0 0 12px 0;font-weight:500;">Your verification code:</p>
              <div style="display:inline-block;background:#1a1d21;color:#fff;padding:20px 40px;border-radius:12px;font-size:40px;font-weight:bold;letter-spacing:12px;font-family:'Courier New',monospace;">${otp}</div>
            </div>
            
            <p style="color:#64748b;font-size:13px;text-align:center;margin:24px 0;">This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
            
            <p style="color:#aaa;font-size:12px;">If you didn't create this account, you can safely ignore this email.</p>
            <p style="color:#bbb;font-size:11px;margin-top:16px;">© ProfitPulse · All rights reserved</p>
          </div>
        </div>
        `,
    });
};

/**
 * Generic Test Email function
 */
export const sendTestEmail = async (to, config) => {
    const transporter = await createTransporter(config);
    await transporter.sendMail({
        from: `"ProfitPulse Test" <${config.auth.user}>`,
        to,
        subject: "SMTP Connection Test — ProfitPulse",
        text: "This is a test email to verify your SMTP configuration in ProfitPulse. If you received this, your settings are correct!",
        html: "<p>This is a test email to verify your SMTP configuration in <b>ProfitPulse</b>. If you received this, your settings are correct!</p>"
    });
};
