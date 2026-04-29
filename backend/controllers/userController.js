import { pool } from "../config/db.js";

export const getAuditLogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 50",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching audit logs", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;
        let avatarUrl = undefined;

        if (req.file) {
            // Build the URL to the uploaded file
            avatarUrl = `/uploads/${req.file.filename}`;
        }

        let query = "UPDATE users SET name = $1";
        let params = [name || null];

        if (avatarUrl) {
            query += ", avatar_url = $2 WHERE id = $3 RETURNING id, name, email, role, avatar_url";
            params.push(avatarUrl, userId);
        } else {
            query += " WHERE id = $2 RETURNING id, name, email, role, avatar_url";
            params.push(userId);
        }

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Log the profile update action
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, $2, $3)",
            [userId, "PROFILE_UPDATE", req.ip]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating profile", error);
        res.status(500).json({ error: "Server error" });
    }
};
