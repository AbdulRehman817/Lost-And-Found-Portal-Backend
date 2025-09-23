// controllers/postController.js
import { Post } from "../models/post.models.js";
import { uploadImageToImageKit } from "../utils/imageKit.js";
import { User } from "../models/user.models.js";

import mongoose from "mongoose";

// ====================== createPost ====================== //
const createPost = async (req, res) => {
  try {
    const { title, description, category, tags, location, type, name, email } =
      req.body;
    const userId = req.auth().userId; // Clerk userId
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
    console.log("name", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // validate image upload

    const newPost = await Post.create({
      title,
      description,
      category,
      location,
      type,
      tags,
      imageUrl,
      name: user.name, // ✅ auto-fill
      email: user.email, // ✅ auto-fill
      userId: user._id, // ✅ link to MongoDB user
      profileImage: user.profileImage, // ✅ Clerk profile image
    });

    res.status(201).json({ success: true, post: newPost });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ message: error.message });
  }
};

// ====================== getAllPosts ====================== //

// ====================== getAllPosts ====================== //

// ====================== getAllPosts ====================== //
const getAllPosts = async (req, res) => {
  try {
    const { type, category, location } = req.query;
    const { userId } = req.auth; // Clerk userId

    // 1. Find the logged-in user in MongoDB
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Build filter
    let filter = { userId: { $ne: dbUser._id } }; // ✅ exclude owner’s posts
    if (type) filter.type = type.toLowerCase();
    if (category) filter.category = category.toLowerCase();
    if (location) filter.location = { $regex: location, $options: "i" };

    // 3. Fetch posts
    const posts = await Post.find(filter)
      .populate("userId", "name email") // shows author info
      .populate("userId", "name email profileImage") // show author info
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
    const { id } = req.params; // get post ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const post = await Post.findById(id).populate(
      "userId",
      "name email imageUrl"
    ); // populate author info

    if (!post) {
      return res.status(400).json({
        message: "Post not found",
      });
    }
    console.log(post);
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
    // Clerk userId
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find user in DB
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({ message: "User not found in database" });
    }

    // Get posts
    const posts = await Post.find({ userId: dbUser._id }).sort({
      createdAt: -1,
    });

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

export {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  getSinglePost,
  getUserPosts,
};
