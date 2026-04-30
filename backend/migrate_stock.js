import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    password: "admin",
    host: "localhost",
    port: 5432,
    database: "ecommerce"
});

async function migrate() {
    try {
        console.log('Starting Stock Management migration...');
        
        // 1. Add opening_stock to products if not exists
        const colCheck = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'opening_stock'");
        if (colCheck.rows.length === 0) {
            await pool.query("ALTER TABLE products ADD COLUMN opening_stock INTEGER DEFAULT 0");
            console.log('Added opening_stock to products');
        }

        // 2. Create stock_transactions table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS stock_transactions (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                type TEXT NOT NULL CHECK (type IN ('opening', 'addition', 'scrap', 'wastage', 'sellout')),
                quantity INTEGER NOT NULL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                created_by INTEGER REFERENCES users(id)
            )
        `);
        console.log('Created stock_transactions table');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
