import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { requireAuth } from "@clerk/express";
import { ensureUser } from "../middleware/ensureUser.js";

const router = express.Router();

// 🔐 Only logged-in users (with Mongo user) can request OTP
router.post("/send-otp", requireAuth, ensureUser, sendOtp);

// 🔐 Only logged-in users (with Mongo user) can verify OTP
router.post("/verify-otp", requireAuth, ensureUser, verifyOtp);

export default router;
