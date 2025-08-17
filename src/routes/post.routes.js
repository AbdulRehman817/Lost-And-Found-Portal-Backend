import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { upload } from "../middleware/user.multer.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/createPost", authMiddleware, upload.single("image"), createPost);
router.get("/getAllPosts", authMiddleware, getAllPosts);
router.put(
  "/updatePost/:id",
  authMiddleware,
  upload.single("image"),
  updatePost
);
router.delete("/deletePost/:id", authMiddleware, deletePost);

export default router;
