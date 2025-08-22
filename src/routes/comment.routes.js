import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { requireAuth } from "@clerk/express";
import { ensureVerified } from "../middleware/ensureVerified.middleware.js";
import { ensureUser } from "../middleware/ensureUser.js";

const router = express.Router();

// ✅ Create comment for a post
router.post(
  "/posts/:postId/comments",
  requireAuth,
  ensureUser,
  ensureVerified,
  createComment
);

// ✅ Get all comments for a post
router.get(
  "/posts/:postId/comments",
  requireAuth,
  ensureUser,
  ensureVerified,
  getComments
);

// ✅ Update a specific comment
router.put(
  "/comments/:commentId",
  requireAuth,
  ensureUser,
  ensureVerified,
  updateComment
);

// ✅ Delete a specific comment
router.delete(
  "/comments/:commentId",
  requireAuth,
  ensureUser,
  ensureVerified,
  deleteComment
);

export default router;
