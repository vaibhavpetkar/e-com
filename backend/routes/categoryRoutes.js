import express from "express";
import { createCategory, getCategories } from "../controllers/categoryController.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();

router.post("/", auth, isAdmin, createCategory);
router.get("/", getCategories);

export default router;
