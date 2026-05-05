import express from "express";
import { createOrder, getOrders, updateOrderStatus, getMyOrders } from "../controllers/orderController.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();

// Public: Place order
router.post("/", auth, createOrder);
router.get("/myorders", auth, getMyOrders);

// Admin: Manage orders
router.get("/", auth, isAdmin, getOrders);
router.put("/:id/status", auth, isAdmin, updateOrderStatus);

export default router;
