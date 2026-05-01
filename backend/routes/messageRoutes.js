import express from "express";
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    password: "admin",
    host: "localhost",
    port: 5432,
    database: "ecommerce"
});

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { message, customer_name, customer_email } = req.body;
        await pool.query(
            "INSERT INTO messages (message, customer_name, customer_email) VALUES ($1, $2, $3)",
            [message, customer_name, customer_email]
        );
        res.status(201).json({ message: "Sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed" });
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM messages ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Failed" });
    }
});

export default router;
