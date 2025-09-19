// routes/likeRoutes.js
import express from "express";
import {
  createLike,
  deleteLike,
  getAllLikes,
  getUserLikeStatus,
} from "../controllers/like.controller.js";

import { requireAuth } from "@clerk/express";
const router = express.Router();

// Get user's like status for a post (must come before /:postId to avoid conflict)
router.get("/likes/user/:postId", requireAuth(), getUserLikeStatus);

// Get all likes for a post
router.get("/likes/:postId", getAllLikes);

// Create or update a like
router.post("/likes/:postId", requireAuth(), createLike);

// Delete/unlike a like
router.delete("/likes/:postId", requireAuth(), deleteLike);

export default router;
