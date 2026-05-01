import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { requestLogger } from "./middleware/requestLogger.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(requestLogger); // Log every request

// ── Static files ──────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/messages", messageRoutes);

// ── 404 Handler ───────────────────────────────────────
app.use((req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
        ip: req.ip || "-",
    });
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
        method: req.method,
        message: `The endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`,
    });
});

// ── Global Error Handler ──────────────────────────────
app.use((err, req, res, next) => {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, {
        message: err.message,
        stack: err.stack?.split("\n")[1]?.trim() || "-",
    });
    res.status(500).json({
        error: "Internal server error",
        message: err.message || "Something went wrong",
    });
});

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.success(`Server started`, {
        port: PORT,
        frontend: process.env.FRONTEND_URL,
        env: process.env.NODE_ENV || "development"
    });
});