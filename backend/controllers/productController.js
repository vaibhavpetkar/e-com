import { pool } from "../config/db.js";

export const createProduct = async (req, res) => {
    const { name, price, description, images, category_id } = req.body;

    const product = await pool.query(
        "INSERT INTO products (name, price, description, category_id) VALUES ($1,$2,$3,$4) RETURNING *",
        [name, price, description, category_id || null]
    );

    const productId = product.rows[0].id;

    if (images && images.length > 0) {
        for (let img of images) {
            await pool.query(
                "INSERT INTO product_images (product_id, image_url) VALUES ($1,$2)",
                [productId, img]
            );
        }
    }

    res.send("Product created");
};

export const getProducts = async (req, res) => {
    const result = await pool.query(`
    SELECT p.id, p.name, p.price, p.description, p.category_id,
    ARRAY_AGG(pi.image_url) as images
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id
    GROUP BY p.id
  `);

    res.json(result.rows);
};