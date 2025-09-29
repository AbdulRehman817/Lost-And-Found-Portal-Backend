import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  getSinglePost,
  getAnotherUserPosts,
  getUserPosts,
} from "../controllers/post.controller.js";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/user.multer.js";
import { syncClerkUser } from "../controllers/user.controllers.js";

const router = express.Router();

// 🔐 Create a post (auth required)
router.post(
  "/createPost",
  requireAuth(),
  upload.single("image"),
  syncClerkUser,
  createPost
);
router.get("/getUserPosts", requireAuth(), getUserPosts);

// 🌐 Public route - get all posts
router.get("/getAllPosts", getAllPosts);
router.get("/feed/:id", getSinglePost);
router.get("/posts/:userId", requireAuth(), getAnotherUserPosts);

// 🔐 Update a post (auth required)
router.put(
  "/updatePost/:id",
  requireAuth(),
  upload.single("image"),
  updatePost
);

// 🔐 Delete a post (auth required)
router.delete("/deletePost/:id", requireAuth(), deletePost);

export default router;
