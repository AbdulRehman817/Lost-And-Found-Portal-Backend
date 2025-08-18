import express from "express";
import { getUserProfile } from "../controllers/user.controllers.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Clerk handles register/login/logout via its SDK on the frontend
// You only keep protected endpoints in your backend

router.get("/profile", requireAuth, getUserProfile);

export default router;
