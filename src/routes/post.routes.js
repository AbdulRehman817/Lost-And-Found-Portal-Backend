import express from "express";
import {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";
import { upload } from "../middleware/user.multer.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.post("/createPost", requireAuth, upload.single("image"), createPost);
router.get("/getAllPosts", requireAuth, getAllPosts);
router.put("/updatePost/:id", requireAuth, upload.single("image"), updatePost);
router.delete("/deletePost/:id", requireAuth, deletePost);

export default router;
