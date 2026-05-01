import express from "express";
import {
    login,
    register,
    verifyEmail,
    verifyEmailOtp,
    resendVerification,
    resendOtp,
    forgotPassword,
    verifyOtp,
    resetPassword,
} from "../controllers/authController.js";
import { emailRateLimiter } from "../middleware/emailRateLimiter.js";

const router = express.Router();

// Customer Authentication (with OTP) - Rate limited
router.post("/register", emailRateLimiter(5, 10), register); // 5 per hour, 10 per day for signup
router.post("/verify-email-otp", emailRateLimiter(10, 20), verifyEmailOtp); // More lenient for verification attempts
router.post("/resend-otp", emailRateLimiter(3, 10), resendOtp); // 3 per hour for resend

// Admin Authentication (legacy)
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password Reset - Rate limited
router.post("/forgot-password", emailRateLimiter(3, 10), forgotPassword); // 3 per hour
router.post("/verify-otp", emailRateLimiter(10, 20), verifyOtp); // More lenient for verification
router.post("/reset-password", resetPassword);

export default router;