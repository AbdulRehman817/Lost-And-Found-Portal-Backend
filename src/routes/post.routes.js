import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/user.multer.js";

const router = express.Router();

// 🔐 Create a post (auth required)
router.post("/createPost", requireAuth(), upload.single("image"), createPost);

// 🌐 Public route - get all posts
router.get("/getAllPosts", getAllPosts);

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
