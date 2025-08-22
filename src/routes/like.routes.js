import express from "express";
import {
  createLike,
  deleteLike,
  getAllLikes,
} from "../controllers/like.controller.js";
import { requireAuth } from "@clerk/express";
import { ensureVerified } from "../middleware/ensureVerified.middleware.js";

const router = express.Router();

// ✅ Like a post
router.post("/like/:id", requireAuth, ensureVerified, createLike);

// ✅ Unlike a post
router.delete("/like/:id", requireAuth, ensureVerified, deleteLike);

// ✅ Get all likes for a post (PROTECTED: optional)
router.get("/like/:id", requireAuth, ensureVerified, getAllLikes);

export default router;
