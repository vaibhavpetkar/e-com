import pkg from "pg";
const { Pool } = pkg;
const pool = new Pool({
    user: "postgres",
    password: "admin",
    host: "localhost",
    port: 5432,
    database: "ecommerce"
});

async function run() {
    const res = await pool.query("SELECT id, title, is_deleted FROM products");
    console.log(res.rows);
    process.exit(0);
}
run();
