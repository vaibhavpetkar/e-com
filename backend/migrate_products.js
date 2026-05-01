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
        console.log('Starting Product/Category migration (v2)...');
        
        // 1. Categories
        const catTableCheck = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'categories'");
        if (catTableCheck.rows.length > 0) {
            const catCols = [
                { name: 'parent_id', type: 'INTEGER REFERENCES categories(id) ON DELETE CASCADE' },
                { name: 'level', type: 'INTEGER DEFAULT 1' }
            ];
            for (let col of catCols) {
                const colCheck = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' AND column_name = $1", [col.name]);
                if (colCheck.rows.length === 0) {
                    await pool.query(`ALTER TABLE categories ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`Added column ${col.name} to categories`);
                }
            }
        }

        // 2. Products
        const tableCheck = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'products'");
        if (tableCheck.rows.length > 0) {
            // Rename name to title if it exists
            const nameColCheck = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'name'");
            if (nameColCheck.rows.length > 0) {
                await pool.query("ALTER TABLE products RENAME COLUMN name TO title");
                console.log('Renamed products.name to products.title');
            }
            
            const colsToAdd = [
                { name: 'brand', type: 'TEXT' },
                { name: 'discount_price', type: 'NUMERIC' },
                { name: 'category_id', type: 'INTEGER REFERENCES categories(id)' },
                { name: 'sub_category_id', type: 'INTEGER REFERENCES categories(id)' },
                { name: 'stock', type: 'INTEGER DEFAULT 0' },
                { name: 'attributes', type: 'JSONB' },
                { name: 'seller_id', type: 'INTEGER REFERENCES users(id)' },
                { name: 'rating', type: 'NUMERIC DEFAULT 0' },
                { name: 'total_reviews', type: 'INTEGER DEFAULT 0' }
            ];

            for (let col of colsToAdd) {
                const colCheck = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = $1", [col.name]);
                if (colCheck.rows.length === 0) {
                    await pool.query(`ALTER TABLE products ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`Added column ${col.name} to products`);
                }
            }
        }

        // 3. Product Images
        await pool.query(`
            CREATE TABLE IF NOT EXISTS product_images (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                image_url TEXT NOT NULL
            )
        `);
        console.log('Ensured product_images table exists');

        console.log('Migration v2 completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
