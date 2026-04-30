import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendInvitationEmail, sendVerificationEmail, sendOtpEmail, sendTestEmail } from "../utils/mailer.js";

/* ─────────────────────────────────────────────
   TEST SMTP CONNECTION (admin only)
───────────────────────────────────────────── */
export const testSmtpConnection = async (req, res) => {
    try {
        const { host, port, user, pass, from, targetEmail } = req.body;
        
        if (!targetEmail) return res.status(400).json({ error: "Target email is required for testing" });

        const config = {
            host,
            port: parseInt(port),
            secure: port === "465",
            auth: { user, pass }
        };

        await sendTestEmail(targetEmail, config);
        res.json({ message: "Test email sent successfully! Please check your inbox." });
    } catch (error) {
        console.error("SMTP Test Error:", error);
        res.status(500).json({ error: "SMTP Connection Failed", details: error.message });
    }
};

/* ─────────────────────────────────────────────
   GET PROFILE (logged-in user)
───────────────────────────────────────────── */
export const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, first_name, last_name, email, role, avatar_url,
                    phone, country, city, state, zip_code, address, is_verified
             FROM users WHERE id=$1`,
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   UPDATE PROFILE (logged-in user)
───────────────────────────────────────────── */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            name, first_name, last_name,
            phone, country, city, state, zip_code, address,
        } = req.body;

        let avatarUrl = undefined;
        if (req.file) {
            avatarUrl = `/uploads/${req.file.filename}`;
        }

        // Build query dynamically
        const fields = [];
        const params = [];
        let idx = 1;

        const set = (col, val) => {
            if (val !== undefined && val !== null) {
                fields.push(`${col} = $${idx++}`);
                params.push(val);
            }
        };

        set("name", name);
        set("first_name", first_name);
        set("last_name", last_name);
        set("phone", phone);
        set("country", country);
        set("city", city);
        set("state", state);
        set("zip_code", zip_code);
        set("address", address);
        if (avatarUrl) set("avatar_url", avatarUrl);

        if (fields.length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }

        params.push(userId);
        const query = `UPDATE users SET ${fields.join(", ")}
                       WHERE id=$${idx}
                       RETURNING id, name, first_name, last_name, email, role, avatar_url,
                                 phone, country, city, state, zip_code, address`;

        const result = await pool.query(query, params);
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [userId, "PROFILE_UPDATE", req.ip]
        );

        const updatedUser = result.rows[0];
        res.json(updatedUser);
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   GET AUDIT LOGS (logged-in user)
───────────────────────────────────────────── */
export const getAuditLogs = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'ADMIN';
        const { startDate, endDate, userId } = req.query;
        
        let query = "SELECT a.*, u.name as user_name, u.email as user_email FROM audit_logs a JOIN users u ON a.user_id = u.id";
        const params = [];
        const conditions = [];

        // If not admin, restrict to own logs
        if (!isAdmin) {
            conditions.push(`a.user_id = $${params.push(req.user.id)}`);
        } else if (userId) {
            // Admin can filter by specific user
            conditions.push(`a.user_id = $${params.push(userId)}`);
        }

        if (startDate) {
            conditions.push(`a.timestamp >= $${params.push(startDate)}`);
        }
        if (endDate) {
            // Append 23:59:59 to include the whole end day if only date is provided
            const end = endDate.includes('T') ? endDate : `${endDate} 23:59:59`;
            conditions.push(`a.timestamp <= $${params.push(end)}`);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY a.timestamp DESC LIMIT 200";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Audit logs error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   GET APP SETTINGS (admin only)
───────────────────────────────────────────── */
export const getAppSettings = async (req, res) => {
    try {
        const result = await pool.query("SELECT key, value FROM app_settings");
        const settings = {};
        result.rows.forEach(row => { settings[row.key] = row.value; });
        res.json(settings);
    } catch (error) {
        console.error("Get settings error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   UPDATE APP SETTING (admin only)
───────────────────────────────────────────── */
export const updateAppSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key) return res.status(400).json({ error: "Key is required" });

        await pool.query(
            `INSERT INTO app_settings (key, value) VALUES ($1,$2)
             ON CONFLICT (key) DO UPDATE SET value=$2`,
            [key, value]
        );

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user.id, `SETTING_UPDATE: ${key}=${value}`, req.ip]
        );

        res.json({ message: "Setting updated", key, value });
    } catch (error) {
        console.error("Update setting error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   GET ALL USERS (admin only)
───────────────────────────────────────────── */
export const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, is_verified, is_active, avatar_url, created_at
             FROM users 
             WHERE is_deleted = false
             ORDER BY id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   ADD USER (admin only)
───────────────────────────────────────────── */
export const addUser = async (req, res) => {
    try {
        const { email, password, role, name } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

        // Check if user exists
        const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
        if (existing.rows.length > 0) return res.status(409).json({ error: "User already exists" });

        const hash = await bcrypt.hash(password, 10);
        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const result = await pool.query(
            `INSERT INTO users (email, password, role, name, is_verified, verification_token, verification_expires, is_active)
             VALUES ($1, $2, $3, $4, false, $5, $6, true)
             RETURNING id, email, role, name`,
            [email, hash, role || "USER", name || email.split("@")[0], token, expires]
        );

        // Send invitation email
        await sendInvitationEmail(email, password, token, name || email.split("@")[0], process.env.FRONTEND_URL);

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user.id, `ADMIN_ADDED_USER: ${email}`, req.ip]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Add user error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   UPDATE USER STATUS (admin only)
───────────────────────────────────────────── */
export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        if (is_active === undefined) return res.status(400).json({ error: "is_active status is required" });

        const result = await pool.query(
            "UPDATE users SET is_active=$1 WHERE id=$2::INTEGER RETURNING id, email, is_active",
            [is_active, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user.id, `USER_STATUS_UPDATE: ${result.rows[0].email} set to ${is_active}`, req.ip]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Update user status error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

/* ─────────────────────────────────────────────
   SOFT DELETE USER (admin only)
   Instead of deleting, mark as deleted
───────────────────────────────────────────── */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE users SET is_deleted=true, deleted_at=NOW(), deleted_by=$1::INTEGER WHERE id=$2::INTEGER RETURNING email",
            [req.user.id, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user.id, `USER_SOFT_DELETE: ${result.rows[0].email}`, req.ip]
        );

        res.json({ message: "User moved to recycle bin", email: result.rows[0].email });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ error: "Server error", details: error.message });
    }
};

/* ─────────────────────────────────────────────
   GET DELETED USERS (admin only)
───────────────────────────────────────────── */
export const getDeletedUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.role, u.deleted_at, b.name as deleted_by_name
             FROM users u
             LEFT JOIN users b ON u.deleted_by = b.id
             WHERE u.is_deleted = true
             ORDER BY u.deleted_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Get deleted users error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

/* ─────────────────────────────────────────────
   RESTORE USER (admin only)
───────────────────────────────────────────── */
export const restoreUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE users SET is_deleted=false, deleted_at=NULL, deleted_by=NULL WHERE id=$1 RETURNING email",
            [id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user.id, `USER_RESTORE: ${result.rows[0].email}`, req.ip]
        );

        res.json({ message: "User restored successfully", email: result.rows[0].email });
    } catch (error) {
        console.error("Restore user error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
