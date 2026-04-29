import express from "express";
import multer from "multer";
import path from "path";
import { getAuditLogs, updateProfile } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, req.user.id + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.get("/audit", auth, getAuditLogs);
router.put("/profile", auth, upload.single("avatar"), updateProfile);

export default router;
