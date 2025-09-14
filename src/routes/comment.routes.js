import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// ✅ Create comment for a post
<<<<<<< HEAD
router.post("/posts/:postId/comments", createComment);

// ✅ Get all comments for a post
router.get("/posts/:postId/comments", getComments);
=======
router.post("/posts/:postId/comments", requireAuth, createComment);

// ✅ Get all comments for a post
router.get("/posts/:postId/comments", requireAuth, getComments);
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c

// ✅ Update a specific comment
router.put("/comments/:commentId", requireAuth, updateComment);

// ✅ Delete a specific comment
router.delete("/comments/:commentId", requireAuth, deleteComment);

export default router;
