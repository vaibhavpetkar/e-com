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
        console.log('Starting Marketplace V2 migration...');
        
        // 1. User Addresses Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS user_addresses (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                label TEXT NOT NULL, -- Home, Office, etc.
                full_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                secondary_phone TEXT,
                email TEXT,
                address_line1 TEXT NOT NULL,
                address_line2 TEXT,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                pincode TEXT NOT NULL,
                is_default BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        console.log('Created user_addresses table');

        // 2. Add columns to orders for tracking and payment
        await pool.query(`
            ALTER TABLE orders 
            ADD COLUMN IF NOT EXISTS payment_id TEXT,
            ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS tracking_number TEXT,
            ADD COLUMN IF NOT EXISTS carrier TEXT,
            ADD COLUMN IF NOT EXISTS estimated_delivery DATE
        `);
        console.log('Updated orders table with tracking/payment columns');

        // 3. Add rating and brand columns to products
        await pool.query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
            ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS brand TEXT,
            ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'
        `);
        console.log('Updated products table with rating/brand columns');

        console.log('Marketplace V2 migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
