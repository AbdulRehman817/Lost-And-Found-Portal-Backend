import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
<<<<<<< HEAD
  getSinglePost,
} from "../controllers/post.controller.js";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/user.multer.js";
import { syncClerkUser } from "../controllers/user.controllers.js";
=======
} from "../controllers/post.controller.js";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/user.multer.js";
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c

const router = express.Router();

// 🔐 Create a post (auth required)
<<<<<<< HEAD
router.post(
  "/createPost",
  requireAuth(),
  upload.single("image"),
  syncClerkUser,
  createPost
);

// 🌐 Public route - get all posts
router.get("/getAllPosts", getAllPosts);
router.get("/feed/:id", getSinglePost);
=======
router.post("/createPost", requireAuth(), upload.single("image"), createPost);

// 🌐 Public route - get all posts
router.get("/getAllPosts", getAllPosts);
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c

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
