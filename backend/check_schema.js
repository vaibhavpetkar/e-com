import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: "postgres",
    password: "admin",
    host: "localhost",
    port: 5432,
    database: "ecommerce"
});

async function check() {
    try {
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log('--- TABLES ---');
        console.log(tables.rows.map(r => r.table_name));

        for (let t of tables.rows) {
            const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1", [t.table_name]);
            console.log(`\nColumns for ${t.table_name}:`);
            console.table(cols.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

check();
