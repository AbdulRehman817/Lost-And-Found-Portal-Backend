import express from "express";
import {
  createLike,
  deleteLike,
  getAllLikes,
} from "../controllers/like.controller.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// ✅ Like a post
router.post("/like/:id", requireAuth, createLike);

// ✅ Unlike a post
router.delete("/like/:id", requireAuth, deleteLike);
router.get("/like/:id", requireAuth, getAllLikes);

export default router;
