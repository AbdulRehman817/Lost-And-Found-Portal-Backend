// controllers/likeController.js
import { Like } from "../models/like.models.js";
import { Post } from "../models/post.models.js";
import { User } from "../models/User.js";

// ====================== createLike ====================== //
const createLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.auth; // Clerk user ID

    // Find MongoDB user
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let existingLike = await Like.findOne({ postId, userId: dbUser._id });

    if (existingLike) {
      if (existingLike.isLiked) {
        return res.status(400).json({ message: "You already liked this post" });
      }

      existingLike.isLiked = true;
      await existingLike.save();

      post.likeCount = (post.likeCount || 0) + 1;
      await post.save();

      return res.status(200).json({
        message: "Post liked again",
        like: existingLike,
      });
    }

    // Create new like
    const newLike = await Like.create({ postId, userId: dbUser._id, isLiked: true });

    post.likeCount = (post.likeCount || 0) + 1;
    await post.save();

    return res.status(201).json({
      message: "Post liked successfully",
      like: newLike,
    });
  } catch (error) {
    console.error("❌ Error liking post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ====================== deleteLike ====================== //
const deleteLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req.auth; // Clerk user ID

    // Find MongoDB user
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({ postId, userId: dbUser._id });
    if (!existingLike || !existingLike.isLiked) {
      return res.status(400).json({ message: "You haven't liked this post yet" });
    }

    existingLike.isLiked = false;
    await existingLike.save();

    if (post.likeCount && post.likeCount > 0) {
      post.likeCount -= 1;
      await post.save();
    }

    return res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("❌ Error unliking post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ====================== getAllLikes ====================== //
const getAllLikes = async (req, res) => {
  try {
    const postId = req.params.id;

    const likes = await Like.find({ postId, isLiked: true }).populate(
      "userId",
      "name email"
    );

    return res.status(200).json({
      message: "Likes fetched successfully",
      count: likes.length,
      data: likes,
    });
  } catch (error) {
    console.error("❌ Error fetching likes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createLike, deleteLike, getAllLikes };
