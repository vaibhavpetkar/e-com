import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)",
        [name, email, hash, role || "USER"]
    );

    res.send("User created");
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

    if (user.rows.length === 0) return res.send("User not found");

    const valid = await bcrypt.compare(password, user.rows[0].password);

    if (!valid) return res.send("Wrong password");

    const token = jwt.sign(
        { id: user.rows[0].id, role: user.rows[0].role },
        "secret"
    );

    // Insert audit log
    await pool.query(
        "INSERT INTO audit_logs (user_id, action, ip_address) VALUES ($1, $2, $3)",
        [user.rows[0].id, "USER_LOGIN", req.ip]
    );

    res.json({
        token,
        user: {
            id: user.rows[0].id,
            name: user.rows[0].name,
            email: user.rows[0].email,
            role: user.rows[0].role,
            avatar_url: user.rows[0].avatar_url
        }
    });
};