import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { requireAuth } from "@clerk/express";
import { ensureUser } from "../middleware/ensureUser.js";
import { ensureVerified } from "../middleware/ensureVerified.middleware.js";
import { upload } from "../middleware/user.multer.js";

const router = express.Router();

// 🔐 Create a post (auth + user + verified email required)
router.post(
  "/createPost",
  requireAuth,
  ensureUser,
  ensureVerified,
  upload.single("image"),
  createPost
);

// 🌐 Public route - get all posts
router.get("/getAllPosts", getAllPosts);

// 🔐 Update a post (auth + user + verified)
router.put(
  "/updatePost/:id",
  requireAuth,
  ensureUser,
  ensureVerified,
  upload.single("image"),
  updatePost
);

// 🔐 Delete a post (auth + user + verified)
router.delete(
  "/deletePost/:id",
  requireAuth,
  ensureUser,
  ensureVerified,
  deletePost
);

export default router;
