import express from "express";
import { 
    createCategory, getCategories, deleteCategory, 
    getDeletedCategories, restoreCategory 
} from "../controllers/categoryController.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();

router.post("/", auth, isAdmin, createCategory);
router.get("/", getCategories);
router.delete("/:id", auth, isAdmin, deleteCategory);
router.get("/deleted", auth, isAdmin, getDeletedCategories);
router.post("/restore/:id", auth, isAdmin, restoreCategory);

export default router;
