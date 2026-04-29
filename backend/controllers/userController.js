import { pool } from "../config/db.js";

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
            `SELECT id, name, email, role, is_verified, avatar_url
             FROM users ORDER BY id DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
