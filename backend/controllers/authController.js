import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { sendVerificationEmail, sendOtpEmail, sendSignupOtpEmail } from "../utils/mailer.js";
import { generateOTP, getOTPExpiry } from "../utils/otpGenerator.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "profitpulse_secret";

/* ─────────────────────────────────────────────
   REGISTER (Customer - with OTP verification)
───────────────────────────────────────────── */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        // Check duplicate
        const existing = await pool.query("SELECT id, is_verified FROM users WHERE email=$1 AND is_deleted=false", [email]);
        
        let userId;
        if (existing.rows.length > 0) {
            if (existing.rows[0].is_verified) {
                return res.status(409).json({ error: "Email already registered" });
            } else {
                // User exists but is unverified, update their password and resend OTP
                const hash = await bcrypt.hash(password, 10);
                await pool.query(
                    "UPDATE users SET name=$1, password=$2 WHERE id=$3",
                    [name, hash, existing.rows[0].id]
                );
                userId = existing.rows[0].id;
            }
        } else {
            // Create user with is_verified = false
            const hash = await bcrypt.hash(password, 10);
            const userResult = await pool.query(
                `INSERT INTO users (name, email, password, role, is_verified, is_active)
                 VALUES ($1,$2,$3,$4,false,true)
                 RETURNING id`,
                [name, email, hash, role || "USER"]
            );
            userId = userResult.rows[0].id;
        }

        // Generate 6-digit OTP (expires in 5 minutes)
        const otp = generateOTP();
        const expiresAt = getOTPExpiry(5);

        // Store OTP in password_resets table (reusing for signup too)
        // Mark it with a flag to distinguish from password reset OTPs
        await pool.query(
            `INSERT INTO password_resets (email, otp, expires_at, used) 
             VALUES ($1, $2, $3, false)`,
            [email, otp, expiresAt]
        );

        // Send OTP email
        try {
            await sendSignupOtpEmail(email, otp);
        } catch (emailErr) {
            console.error("Failed to send OTP email (check SMTP settings). OTP is:", otp);
            // Continue registration anyway for local development
        }

        return res.status(201).json({
            message: "Registration successful! OTP sent to your email.",
            email: email,
            requiresOtpVerification: true,
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
};

/* ─────────────────────────────────────────────
   LOGIN
───────────────────────────────────────────── */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = result.rows[0];

        // Check if user is soft-deleted
        if (user.is_deleted) {
            return res.status(403).json({ error: "Account no longer exists" });
        }

        // Check if user is inactive
        if (!user.is_active) {
            return res.status(403).json({ error: "Your account is deactivated. Please contact administrator." });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        // Check verification
        if (!user.is_verified) {
            return res.status(403).json({
                error: "Email not verified",
                pendingVerification: true,
                email: user.email,
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: "7d",
        });

        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [user.id, "USER_LOGIN", req.ip]
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Server error during login" });
    }
};

/* ─────────────────────────────────────────────
   VERIFY EMAIL OTP (Signup)
───────────────────────────────────────────── */
export const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        // Find user
        const userResult = await pool.query(
            "SELECT id FROM users WHERE email=$1 AND is_deleted=false",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const userId = userResult.rows[0].id;

        // Find OTP record
        const otpResult = await pool.query(
            `SELECT id, expires_at FROM password_resets
             WHERE email=$1 AND otp=$2 AND used=false
             ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );

        if (otpResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        const otpRecord = otpResult.rows[0];

        // Check expiry
        if (new Date(otpRecord.expires_at) < new Date()) {
            return res.status(400).json({ error: "OTP has expired. Please request a new one." });
        }

        // Mark OTP as used
        await pool.query("UPDATE password_resets SET used=true WHERE id=$1", [otpRecord.id]);

        // Mark user as verified
        await pool.query(
            "UPDATE users SET is_verified=true WHERE id=$1",
            [userId]
        );

        res.json({ message: "Email verified successfully!" });
    } catch (error) {
        console.error("Verify email OTP error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   VERIFY EMAIL
───────────────────────────────────────────── */
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: "Token is required" });

        const result = await pool.query(
            "SELECT * FROM users WHERE verification_token=$1",
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid or expired verification link" });
        }

        const user = result.rows[0];
        if (new Date(user.verification_expires) < new Date()) {
            return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
        }

        await pool.query(
            "UPDATE users SET is_verified=true, verification_token=NULL, verification_expires=NULL WHERE id=$1",
            [user.id]
        );

        res.json({ message: "Email verified successfully! You can now log in." });
    } catch (error) {
        console.error("Verify email error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   RESEND VERIFICATION
───────────────────────────────────────────── */
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No account found with this email" });
        }

        const user = result.rows[0];
        if (user.is_verified) {
            return res.status(400).json({ error: "This account is already verified" });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await pool.query(
            "UPDATE users SET verification_token=$1, verification_expires=$2 WHERE id=$3",
            [token, expires, user.id]
        );

        await sendVerificationEmail(email, token);

        res.json({ message: "Verification email resent! Please check your inbox." });
    } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   RESEND OTP (Email Verification)
───────────────────────────────────────────── */
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Find user
        const userResult = await pool.query(
            "SELECT id, is_verified FROM users WHERE email=$1 AND is_deleted=false",
            [email]
        );

        if (userResult.rows.length === 0) {
            // Security: don't reveal if email exists
            return res.json({ message: "If this email is registered, a new OTP has been sent." });
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            return res.status(400).json({ error: "This account is already verified" });
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = getOTPExpiry(5);

        // Invalidate old OTPs for this email
        await pool.query(
            "UPDATE password_resets SET used=true WHERE email=$1 AND used=false",
            [email]
        );

        // Insert new OTP
        await pool.query(
            `INSERT INTO password_resets (email, otp, expires_at, used) 
             VALUES ($1, $2, $3, false)`,
            [email, otp, expiresAt]
        );

        // Send OTP email
        try {
            await sendSignupOtpEmail(email, otp);
        } catch (emailErr) {
            console.error("Failed to send OTP email (check SMTP settings). OTP is:", otp);
        }

        res.json({ message: "OTP resent! Please check your email." });
    } catch (error) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   FORGOT PASSWORD — Send OTP
───────────────────────────────────────────── */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const result = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
        if (result.rows.length === 0) {
            // Security: don't reveal if email exists
            return res.json({ message: "If this email is registered, an OTP has been sent." });
        }

        // 6-digit OTP, expires in 5 min
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 5 * 60 * 1000);

        // Invalidate old OTPs for this email
        await pool.query("UPDATE password_resets SET used=true WHERE email=$1", [email]);

        await pool.query(
            "INSERT INTO password_resets (email, otp, expires_at) VALUES ($1,$2,$3)",
            [email, otp, expires]
        );

        try {
            await sendOtpEmail(email, otp);
        } catch (emailErr) {
            console.error("Failed to send OTP email (check SMTP settings). OTP is:", otp);
        }

        res.json({ message: "OTP sent to your email address." });
    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   VERIFY OTP
───────────────────────────────────────────── */
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

        const result = await pool.query(
            `SELECT * FROM password_resets
             WHERE email=$1 AND otp=$2 AND used=false
             ORDER BY created_at DESC LIMIT 1`,
            [email, otp]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: "Invalid OTP" });
        }

        const record = result.rows[0];
        if (new Date(record.expires_at) < new Date()) {
            return res.status(400).json({ error: "OTP has expired. Please request a new one." });
        }

        // Mark as used so it can't be reused
        await pool.query("UPDATE password_resets SET used=true WHERE id=$1", [record.id]);

        // Issue a short-lived reset token
        const resetToken = jwt.sign({ email, purpose: "password_reset" }, JWT_SECRET, {
            expiresIn: "10m",
        });

        res.json({ message: "OTP verified", resetToken });
    } catch (error) {
        console.error("Verify OTP error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   RESET PASSWORD
───────────────────────────────────────────── */
export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).json({ error: "Reset token and new password are required" });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, JWT_SECRET);
        } catch {
            return res.status(400).json({ error: "Reset token is invalid or expired" });
        }

        if (decoded.purpose !== "password_reset") {
            return res.status(400).json({ error: "Invalid token purpose" });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password=$1 WHERE email=$2", [hash, decoded.email]);

        res.json({ message: "Password reset successfully! You can now log in." });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};