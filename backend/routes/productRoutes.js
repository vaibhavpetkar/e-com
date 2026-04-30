import express from "express";
import { 
    createProduct, getProducts, deleteProduct, 
    getDeletedProducts, restoreProduct 
} from "../controllers/productController.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();

router.post("/", auth, isAdmin, createProduct);
router.get("/", getProducts);
router.delete("/:id", auth, isAdmin, deleteProduct);
router.get("/deleted", auth, isAdmin, getDeletedProducts);
router.post("/restore/:id", auth, isAdmin, restoreProduct);

export default router;