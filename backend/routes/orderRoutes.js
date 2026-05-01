import express from "express";
import { createOrder, getOrders, updateOrderStatus } from "../controllers/orderController.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();

// Public: Place order
router.post("/", createOrder);

// Admin: Manage orders
router.get("/", auth, isAdmin, getOrders);
router.put("/:id/status", auth, isAdmin, updateOrderStatus);

export default router;
