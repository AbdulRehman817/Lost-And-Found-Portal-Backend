import { Comment } from "../models/comment.models.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/user.models.js";

// ✅ Helper: get MongoDB user from Clerk
const getDbUser = async (clerkId) => {
  return await User.findOne({ clerkId });
};

// ==================== Create Comment ====================

const createComment = async (req, res) => {
  try {
    const { message, parentId } = req.body;
    const postId = req.params.id;
    const clerkId = req.auth.userId;

    if (!postId)
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });
    if (!message || message.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });
    }

    // ✅ Get MongoDB user
    const dbUser = await getDbUser(clerkId);
    if (!dbUser)
      return res.status(401).json({ success: false, error: "User not found" });

    // ✅ Check if post exists
    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ success: false, error: "Post not found" });

    // ✅ Prevent duplicate
    const existingComment = await Comment.findOne({
      postId,
      userId: dbUser._id,
      message,
    });
    if (existingComment) {
      return res
        .status(400)
        .json({ success: false, error: "Comment already exists" });
    }

    // ✅ Create comment
    const newComment = new Comment({
      postId,
      userId: dbUser._id,
      message,
      parentId: parentId || null,
    });
    await newComment.save();

    // ✅ Update comment count
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error. Please try again later." });
  }
};

// ==================== Get Comments ====================

const getComments = async (req, res) => {
  try {
    const postId = req.params.id;
    if (!postId)
      return res
        .status(400)
        .json({ success: false, error: "Post ID is required" });

    const post = await Post.findById(postId);
    if (!post)
      return res.status(404).json({ success: false, error: "Post not found" });

    const comments = await Comment.find({
      postId,
      parentId: null,
      isDeleted: false,
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({
          parentId: comment._id,
          isDeleted: false,
        })
          .populate("userId", "name email")
          .sort({ createdAt: 1 });

        return { ...comment._doc, replies };
      })
    );

    return res.status(200).json({
      success: true,
      count: comments.length,
      comments: commentsWithReplies,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error. Please try again later." });
  }
};

// ==================== Delete Comment ====================

const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const clerkId = req.auth.userId;

    if (!commentId)
      return res
        .status(400)
        .json({ success: false, error: "Comment ID is required" });

    const dbUser = await getDbUser(clerkId);
    if (!dbUser)
      return res.status(401).json({ success: false, error: "User not found" });

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    if (comment.userId.toString() !== dbUser._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Not authorized to delete this comment",
        });
    }

    comment.isDeleted = true;
    await comment.save();

    const post = await Post.findById(comment.postId);
    if (post && post.commentCount > 0) {
      post.commentCount -= 1;
      await post.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error. Please try again later." });
  }
};

// ==================== Update Comment ====================

const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { message } = req.body;
    const clerkId = req.auth.userId;

    if (!commentId)
      return res
        .status(400)
        .json({ success: false, error: "Comment ID is required" });
    if (!message || message.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Message is required" });
    }

    const dbUser = await getDbUser(clerkId);
    if (!dbUser)
      return res.status(401).json({ success: false, error: "User not found" });

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found" });
    }

    if (comment.userId.toString() !== dbUser._id.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Not authorized to update this comment",
        });
    }

    comment.message = message;
    await comment.save();

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server error. Please try again later." });
  }
};

export { createComment, getComments, deleteComment, updateComment };
