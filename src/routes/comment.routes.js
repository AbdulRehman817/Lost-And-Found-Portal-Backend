import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { requireAuth } from "@clerk/express";
import { ensureVerified } from "../middleware/ensureVerified.middleware.js";

const router = express.Router();

// TODO ----------------- Comments Routes -----------------

//! Create comment for a post
router.post(
  "/posts/:postId/comments",
  ensureVerified,
  requireAuth,
  createComment
);

//! Get all comments for a post
router.get("/posts/:postId/comments", ensureVerified, getComments);

//! Update a specific comment
router.put("/comments/:commentId", ensureVerified, requireAuth, updateComment);

//! Delete a specific comment
router.delete(
  "/comments/:commentId",
  ensureVerified,
  requireAuth,
  deleteComment
);

export default router;
