import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controllers.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Clerk handles auth, so just protect endpoints with requireAuth
router.get("/profile", requireAuth(), getUserProfile);
router.put("/profile", requireAuth(), updateUserProfile);

export default router;
