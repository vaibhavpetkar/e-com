import { pool } from "../config/db.js";

export const createOrder = async (req, res) => {
    const client = await pool.connect();
    try {
        // T2-1 & T2-2: Require authentication
        if (!req.user) {
            return res.status(401).json({ 
                error: "Authentication required to place an order. Please log in first.",
                requiresLogin: true 
            });
        }

        // T2-3: Check email verification
        const userRes = await client.query(
            "SELECT is_verified, email FROM users WHERE id = $1",
            [req.user.id]
        );

        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = userRes.rows[0];
        if (!user.is_verified) {
            return res.status(403).json({
                error: "Email verification required before placing an order. Please verify your email.",
                requiresEmailVerification: true,
                email: user.email
            });
        }

        const { 
            customerName, customerEmail, customerPhone, 
            shippingAddress, items, totalAmount 
        } = req.body;

        await client.query('BEGIN');

        // T2-4: Auto-populate user info from JWT token
        const orderRes = await client.query(
            `INSERT INTO orders (
                user_id, customer_name, customer_email, customer_phone, 
                shipping_address, total_amount
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [req.user.id, customerName || user.email, customerEmail || user.email, customerPhone, shippingAddress, totalAmount]
        );

        const orderId = orderRes.rows[0].id;

        // Create Order Items
        for (let item of items) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.productId, item.quantity, item.price]
            );

            // Reduce stock
            await client.query(
                "UPDATE products SET stock = stock - $1 WHERE id = $2",
                [item.quantity, item.productId]
            );

            // Log stock transaction
            await client.query(
                "INSERT INTO stock_transactions (product_id, type, quantity, reason, created_by) VALUES ($1, $2, $3, $4, $5)",
                [item.productId, 'sellout', item.quantity, `Order #${orderId}`, req.user.id]
            );
        }

        // Log order creation in audit
        await client.query(
            "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, $2, $3)",
            [req.user.id, `ORDER_PLACED: #${orderId}`, req.ip]
        );

        await client.query('COMMIT');
        res.status(201).json({ 
            ...orderRes.rows[0],
            message: "Order placed successfully!" 
        });
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
        const { status, tracking_number, carrier } = req.body;
        
        const result = await pool.query(
            "UPDATE orders SET status = COALESCE($1, status), tracking_number = COALESCE($2, tracking_number), carrier = COALESCE($3, carrier) WHERE id = $4 RETURNING *",
            [status, tracking_number, carrier, id]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ error: "Order not found" });

        // Log the status change
        if (status) {
            await pool.query(
                "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, $2, $3)",
                [req.user.id, `ORDER_STATUS_UPDATE: #${id} to ${status}`, req.ip]
            );
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
