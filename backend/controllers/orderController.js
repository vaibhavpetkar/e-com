import { pool } from "../config/db.js";

export const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        const { 
            customerName, customerEmail, customerPhone, 
            shippingAddress, items, totalAmount 
        } = req.body;

        await client.query('BEGIN');

        // 1. Create Order
        const orderRes = await client.query(
            `INSERT INTO orders (
                user_id, customer_name, customer_email, customer_phone, 
                shipping_address, total_amount
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user?.id || null, customerName, customerEmail, customerPhone, shippingAddress, totalAmount]
        );

        const orderId = orderRes.rows[0].id;

        // 2. Create Order Items
        for (let item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.productId, item.quantity, item.price]
            );

            // Optional: Reduce stock
            await client.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [item.quantity, item.productId]
            );

            // Log stock transaction
            await client.query(
                "INSERT INTO stock_transactions (product_id, type, quantity, reason, created_by) VALUES ($1, $2, $3, $4, $5)",
                [item.productId, 'sellout', item.quantity, `Order #${orderId}`, req.user?.id || null]
            );
        }

        await client.query('COMMIT');
        res.status(201).json(orderRes.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ error: "Failed to place order" });
    } finally {
        client.release();
    }
};

export const getOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT o.*, 
            JSON_AGG(JSON_BUILD_OBJECT(
                'id', oi.id,
                'product_id', oi.product_id,
                'title', p.title,
                'quantity', oi.quantity,
                'price', oi.price_at_time
            )) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await pool.query(
            "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });

        // Audit log
        await pool.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1,$2,$3)",
            [req.user?.id, `ORDER_STATUS_UPDATE: #${id} to ${status}`, req.ip]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
