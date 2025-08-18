import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// TODO ----------------- Comments Routes -----------------

//**  Create a comment for a specific post
//! POST /api/comments/:id  (id = postId)
router.post("/:id", authMiddleware, createComment);

//**  Get all comments for a specific post
//! GET /api/comments/:id  (id = postId)
router.get("/:id", getComments);

//**  Update a specific comment
//! PUT /api/comments/:id  (id = commentId)
router.put("/:id", authMiddleware, updateComment);

//**  Delete a specific comment (soft delete)
//! DELETE /api/comments/:id  (id = commentId)
router.delete("/:id", authMiddleware, deleteComment);

export default router;
