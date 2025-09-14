import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  syncClerkUser, // 👈 import
} from "../controllers/user.controllers.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Protect routes with Clerk + also sync user into Mongo
router.get("/profile", requireAuth(), syncClerkUser, getUserProfile);
router.put("/profile", requireAuth(), syncClerkUser, updateUserProfile);

export default router;
