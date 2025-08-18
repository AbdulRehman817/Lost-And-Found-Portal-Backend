import { Comment } from "../models/comment.models.js";
import { Post } from "../models/post.models.js";

// TODO ==================== Create Comment ====================
const createComment = async (req, res) => {
  try {
    const { message } = req.body;
    const postId = req.params.id;
    const userId = req.user._id; // comes from auth middleware

    // ✅ Validation
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }
    if (!message || message.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });
    }

    // ✅ Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // ✅ Create new comment
    const newComment = new Comment({
      postId,
      userId,
      message,
    });

    await newComment.save();

    // ✅ Update post’s comment count
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    // ✅ Send response
    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

// TODO ==================== Get Comments ====================
const getComments = (req, res) => {
  try {
    const postId = req.params.id;
    if (!postId) {
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    }
    const post = Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    const comments = Comment.findById(postId)
      .populate("authorId", "name email avatar") // only select what you need
      .sort({ createdAt: -1 }); // newest first
    return res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

// TODO ==================== Delete Comment (Soft Delete) ====================
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    if (!commentId) {
      return res
        .status(400)
        .json({ success: false, error: "Comment ID is required" });
    }
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this comment",
      });
    }
    comment.isDeleted = true;
    await comment.save();

    // ✅ Update post's comment count
    const post = await Post.findById(comment.postId);
    if (post && post.commentCount > 0) {
      post.commentCount -= 1;
      await post.save();
    }

    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

// TODO ==================== Update Comment ====================
const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;
    const { message } = req.body;

    // ✅ Validate inputs
    if (!commentId) {
      return res
        .status(400)
        .json({ success: false, error: "Comment ID is required" });
    }
    if (!message || message.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });
    }

    // ✅ Find comment
    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    // ✅ Check ownership
    if (comment.authorId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to update this comment",
      });
    }

    // ✅ Update message
    comment.message = message;
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({
      success: false,
      error: "Server error. Please try again later.",
    });
  }
};

export { createComment, getComments, deleteComment, updateComment };
