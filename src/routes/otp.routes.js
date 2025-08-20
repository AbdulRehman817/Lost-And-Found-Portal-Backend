import express from "express";
import { sendOtp, verifyOtp } from "../controllers/otp.controllers.js";
import { ensureUser } from "../middlewares/ensureUser.js";

const router = express.Router();

router.post("/send-otp", ensureUser, sendOtp);
router.post("/verify-otp", ensureUser, verifyOtp);

export default router;
