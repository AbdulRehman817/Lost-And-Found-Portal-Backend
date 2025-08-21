import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controller.js";
import { ensureUser } from "../middleware/ensureUser.js";

const router = express.Router();

router.post("/send-otp", ensureUser, sendOtp);
router.post("/verify-otp", ensureUser, verifyOtp);

export default router;
