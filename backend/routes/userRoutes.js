import express from "express";
import multer from "multer";
import path from "path";
import {
    getProfile,
    updateProfile,
    getAuditLogs,
    getAppSettings,
    updateAppSetting,
    getUsers,
} from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
import { isAdmin } from "../middleware/role.js";

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, req.user.id + "-" + Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// Profile routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, upload.single("avatar"), updateProfile);

// Audit log
router.get("/audit-logs", auth, getAuditLogs);

// Admin settings routes
router.get("/settings", auth, isAdmin, getAppSettings);
router.put("/settings", auth, isAdmin, updateAppSetting);

// Admin user management
router.get("/all", auth, isAdmin, getUsers);

export default router;
