import express from "express";
import { createProduct, getProducts } from "../controllers/productController.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();

router.post("/", auth, isAdmin, createProduct);
router.get("/", getProducts);

export default router;