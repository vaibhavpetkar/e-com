import { pool } from "../config/db.js";

export const createProduct = async (req, res) => {
    const { name, price, description, images, category_id } = req.body;

    const product = await pool.query(
        "INSERT INTO products (name, price, description, category_id) VALUES ($1,$2,$3,$4) RETURNING *",
        [name, price, description, category_id || null]
    );

    const productId = product.rows[0].id;

    if (images && images.length > 0) {
        for (let img of images) {
            await pool.query(
                "INSERT INTO product_images (product_id, image_url) VALUES ($1,$2)",
                [productId, img]
            );
        }
    }

    res.send("Product created");
};

export const getProducts = async (req, res) => {
    const result = await pool.query(`
    SELECT p.id, p.name, p.price, p.description, p.category_id,
    ARRAY_AGG(pi.image_url) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE p.is_deleted = false
    GROUP BY p.id
  `);

    res.json(result.rows);
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE products SET is_deleted=true, deleted_at=NOW(), deleted_by=$1 WHERE id=$2 RETURNING name",
            [req.user.id, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user.id, `PRODUCT_SOFT_DELETE: ${result.rows[0].name}`, req.ip]
        );

        res.json({ message: "Product moved to recycle bin" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getDeletedProducts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, u.name as deleted_by_name FROM products p 
             LEFT JOIN users u ON p.deleted_by = u.id 
             WHERE p.is_deleted = true ORDER BY p.deleted_at DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const restoreProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE products SET is_deleted=false, deleted_at=NULL, deleted_by=NULL WHERE id=$1 RETURNING name",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user.id, `PRODUCT_RESTORE: ${result.rows[0].name}`, req.ip]
        );

        res.json({ message: "Product restored successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};