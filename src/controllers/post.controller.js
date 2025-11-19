// controllers/postController.js
import { Post } from "../models/post.models.js";
import { uploadImageToImageKit } from "../utils/imageKit.js";
import { User } from "../models/user.models.js";

import mongoose from "mongoose";

// ====================== createPost ====================== //
const createPost = async (req, res) => {
  try {
    const { title, description, category, tags, location, type } = req.body;
    const { userId } = req.auth;
    console.log(userId);

    // 1. Validate required fields
    if (!title || !type || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Validate "type"
    if (!["lost", "found"].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'lost' or 'found'",
      });
    }

    // 3. Validate image
    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const imageUrl = await uploadImageToImageKit(req.file.path);
    if (!imageUrl) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    // find user in Mongo by Clerk ID
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Only store fields that exist in Post schema
    const newPost = await Post.create({
      title,
      description,
      category,
      location,
      type: type.toLowerCase(),
      tags: tags || [],
      imageUrl,
      userId: user._id, // ✅ Only store userId reference
    });

    // ✅ Populate user details after creation
    await newPost.populate("userId", "name email profileImage");

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const { type, category, location } = req.query;

    // Build filter
    let filter = {};

    // ✅ Only exclude user's posts if authenticated
    if (req.auth?.userId) {
      const dbUser = await User.findOne({ clerkId: req.auth.userId });
      if (dbUser) {
        filter.userId = { $ne: dbUser._id }; // Exclude logged-in user's posts
      }
    }

    // Apply other filters
    if (type) filter.type = type.toLowerCase();
    if (category) filter.category = category.toLowerCase();
    if (location) filter.location = { $regex: location, $options: "i" };

    // Fetch posts
    const posts = await Post.find(filter)
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(id).populate(
      "userId",
      "name email profileImage" // ✅ Fixed: changed imageUrl to profileImage
    );

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post found",
      data: post,
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ====================== updatePost ====================== //
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const { title, type, description, tags, category, location, imageUrl } =
      req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // ✅ Ownership check with Clerk user
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser || post.userId.toString() !== dbUser._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    if (type && !["lost", "found"].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Type must be either 'lost' or 'found'",
      });
    }

    // Update fields
    if (title) post.title = title;
    if (type) post.type = type.toLowerCase();
    if (description) post.description = description;
    if (category) post.category = category;
    if (location) post.location = location;
    if (imageUrl) post.imageUrl = imageUrl;
    if (tags) post.tags = tags;

    await post.save();

    // ✅ Populate user info before returning
    await post.populate("userId", "name email profileImage");

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: post,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ====================== deletePost ====================== //
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.auth;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // ✅ Ownership check with Clerk user
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser || post.userId.toString() !== dbUser._id.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ====================== getUserPosts ====================== //
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find user in DB
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({ message: "User not found in database" });
    }

    // Get posts with populated user info
    const posts = await Post.find({ userId: dbUser._id })
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== getAnotherUserPosts ====================== //
const getAnotherUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    let dbUser;

    // 1️⃣ First check if it's a valid Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(userId)) {
      dbUser = await User.findById(userId);
    }

    // 2️⃣ If not found by ObjectId, try clerkId
    if (!dbUser) {
      dbUser = await User.findOne({ clerkId: userId });
    }

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3️⃣ Find posts using Mongo user._id
    const posts = await Post.find({ userId: dbUser._id })
      .populate("userId", "name email profileImage")
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No posts found for this user",
      });
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("Error fetching another user posts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  getSinglePost,
  getAnotherUserPosts,
  getUserPosts,
};
