import { pool } from "../config/db.js";
import { getSymbol } from "../utils/currency.js";

export const createProduct = async (req, res) => {
    try {
        const { 
            title, description, brand, price, discountPrice, 
            categoryId, subCategoryId, images, stock, openingStock, attributes, sellerId 
        } = req.body;

        const product = await pool.query(
            `INSERT INTO products (
                title, description, brand, price, discount_price, 
                category_id, sub_category_id, stock, opening_stock, attributes, seller_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [
                title, description, brand, price, discountPrice || null, 
                categoryId || null, subCategoryId || null, stock || 0, 
                openingStock || 0, attributes ? JSON.stringify(attributes) : null, sellerId || req.user?.id
            ]
        );

        const productId = product.rows[0].id;

        // Log opening stock transaction if provided
        if (openingStock && openingStock > 0) {
            await pool.query(
                "INSERT INTO stock_transactions (product_id, type, quantity, reason, created_by) VALUES ($1, $2, $3, $4, $5)",
                [productId, 'opening', openingStock, 'Initial product setup', req.user?.id]
            );
        }

        if (images && images.length > 0) {
            for (let img of images) {
                await pool.query(
                    "INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)",
                    [productId, img]
                );
            }
        }

        res.status(201).json({ message: "Product created", product: product.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const settingsRes = await pool.query("SELECT value FROM app_settings WHERE key = 'default_currency'");
        const currencyCode = settingsRes.rows[0]?.value || 'USD';
        const currencySymbol = getSymbol(currencyCode);

        const result = await pool.query(`
            SELECT p.*, c.name as category_name,
            ARRAY_AGG(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.is_deleted = false
            GROUP BY p.id, c.name
            ORDER BY p.created_at DESC
        `);

        const productsWithCurrency = result.rows.map(p => ({
            ...p,
            currency_symbol: currencySymbol
        }));

        res.json(productsWithCurrency);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE products SET is_deleted=true, deleted_at=NOW(), deleted_by=$1 WHERE id=$2 RETURNING title",
            [req.user?.id, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user?.id, `PRODUCT_SOFT_DELETE: ${result.rows[0].title}`, req.ip]
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
            "UPDATE products SET is_deleted=false, deleted_at=NULL, deleted_by=NULL WHERE id=$1 RETURNING title",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user?.id, `PRODUCT_RESTORE: ${result.rows[0].title}`, req.ip]
        );

        res.json({ message: "Product restored successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const settingsRes = await pool.query("SELECT value FROM app_settings WHERE key = 'default_currency'");
        const currencyCode = settingsRes.rows[0]?.value || 'USD';
        const currencySymbol = getSymbol(currencyCode);

        const result = await pool.query(`
            SELECT p.*, 
            ARRAY_AGG(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL) as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = $1 AND p.is_deleted = false
            GROUP BY p.id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const product = {
            ...result.rows[0],
            currency_symbol: currencySymbol
        };

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};