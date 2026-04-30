import { pool } from "../config/db.js";

export const createTransaction = async (req, res) => {
    const client = await pool.connect();
    try {
        const { productId, type, quantity, reason } = req.body;
        
        await client.query('BEGIN');

        // 1. Create Transaction Record
        const transaction = await client.query(
            `INSERT INTO stock_transactions (product_id, type, quantity, reason, created_by) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [productId, type, quantity, reason, req.user.id]
        );

        // 2. Update Product Stock
        // Addition/Opening increase stock, others decrease
        const multiplier = (type === 'addition' || type === 'opening') ? 1 : -1;
        const adjustment = quantity * multiplier;

        await client.query(
            "UPDATE products SET stock = stock + $1 WHERE id = $2",
            [adjustment, productId]
        );

        await client.query('COMMIT');
        res.status(201).json(transaction.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Inventory transaction failed" });
    } finally {
        client.release();
    }
};

export const getTransactions = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT st.*, p.title as product_title, u.name as user_name 
            FROM stock_transactions st
            JOIN products p ON st.product_id = p.id
            LEFT JOIN users u ON st.created_by = u.id
            ORDER BY st.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getProductStockHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "SELECT * FROM stock_transactions WHERE product_id = $1 ORDER BY created_at DESC",
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
