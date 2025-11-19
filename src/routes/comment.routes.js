import express from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";
import { requireAuth } from "@clerk/express";
import { getCommentNotifications } from "../controllers/commentNotification.controller.js";

const router = express.Router();

router.get("/notifications/comments", requireAuth(), getCommentNotifications);
// ✅ Create comment for a post
router.post("/posts/:postId/comments", createComment);

// ✅ Get all comments for a post
router.get("/posts/:postId/comments", getComments);

// ✅ Update a specific comment
router.put("/comments/:commentId", requireAuth, updateComment);

// ✅ Delete a specific comment
router.delete("/comments/:commentId", requireAuth, deleteComment);

export default router;
