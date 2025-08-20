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
router.post("/like/:id", ensureVerified, requireAuth, createLike);

// ✅ Unlike a post
router.delete("/like/:id", ensureVerified, requireAuth, deleteLike);
router.get("/like/:id", ensureVerified, requireAuth, getAllLikes);

export default router;
