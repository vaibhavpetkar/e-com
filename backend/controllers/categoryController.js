import { pool } from "../config/db.js";

export const createCategory = async (req, res) => {
    try {
        const { name, description, parentId, level } = req.body;
        const result = await pool.query(
            "INSERT INTO categories (name, description, parent_id, level) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, description, parentId || null, level || 1]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getCategories = async (req, res) => {
    try {
        // Fetch all categories and build a hierarchy or just return flat list
        // Returning flat list for now, frontend can build hierarchy
        const result = await pool.query("SELECT * FROM categories WHERE is_deleted = false ORDER BY level ASC, id ASC");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE categories SET is_deleted=true, deleted_at=NOW(), deleted_by=$1 WHERE id=$2 RETURNING name",
            [req.user?.id, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Category not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user?.id, `CATEGORY_SOFT_DELETE: ${result.rows[0].name}`, req.ip]
        );

        res.json({ message: "Category moved to recycle bin" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getDeletedCategories = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, u.name as deleted_by_name FROM categories c 
             LEFT JOIN users u ON c.deleted_by = u.id 
             WHERE c.is_deleted = true ORDER BY c.deleted_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const restoreCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE categories SET is_deleted=false, deleted_at=NULL, deleted_by=NULL WHERE id=$1 RETURNING name",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Category not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user?.id, `CATEGORY_RESTORE: ${result.rows[0].name}`, req.ip]
        );

        res.json({ message: "Category restored successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
