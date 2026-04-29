import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../config/db.js";
import { sendVerificationEmail, sendOtpEmail } from "../utils/mailer.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "profitpulse_secret";

/* ─────────────────────────────────────────────
   REGISTER
───────────────────────────────────────────── */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check duplicate
        const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Email already registered" });
        }

        // Check global setting
        const settingRes = await pool.query(
            "SELECT value FROM app_settings WHERE key='require_email_verification'"
        );
        const requireVerification = settingRes.rows[0]?.value === "true";

        const hash = await bcrypt.hash(password, 10);

        if (requireVerification) {
            // Generate verification token (24h)
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            await pool.query(
                `INSERT INTO users (name, email, password, role, is_verified, verification_token, verification_expires)
                 VALUES ($1,$2,$3,$4,false,$5,$6)`,
                [name, email, hash, role || "USER", token, expires]
            );

            await sendVerificationEmail(email, token);

            return res.status(201).json({
                message: "Registration successful! Please check your email to verify your account.",
                requiresVerification: true,
            });
        } else {
            await pool.query(
                "INSERT INTO users (name, email, password, role, is_verified) VALUES ($1,$2,$3,$4,true)",
                [name, email, hash, role || "USER"]
            );
            return res.status(201).json({ message: "User created" });
        }
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

        await sendOtpEmail(email, otp);

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