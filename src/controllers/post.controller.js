import { Post } from "../models/post.models.js";
import { uploadImageToImageKit } from "../utils/imageKit.js";

// ====================== createPost ====================== //
const createPost = async (req, res) => {
  try {
    const { title, type, description, category, location } = req.body;

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

    // 4. Create post with MongoDB User._id
    const newPost = await Post.create({
      userId: req.dbUser._id, // ✅ from ensureUser
      title,
      type: type.toLowerCase(),
      description,
      category,
      location,
      imageUrl,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// ====================== getAllPosts ====================== //
const getAllPosts = async (req, res) => {
  try {
    const { type, category, location } = req.query;

    // Dynamic filter
    let filter = {};
    if (type) filter.type = type.toLowerCase();
    if (category) filter.category = category.toLowerCase();
    if (location) filter.location = { $regex: location, $options: "i" };

    const posts = await Post.find(filter)
      .populate("userId", "name email") // ✅ fixed fields
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

// ====================== updatePost ====================== //
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, description, category, location, imageUrl } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // ✅ Ownership check with MongoDB User._id
    if (post.userId.toString() !== req.dbUser._id.toString()) {
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
    if (imageUrl) post.imageUrl = imageUrl; // fix here (your schema field is imageUrl)

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

    const post = await Post.findById(id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    // ✅ Ownership check
    if (post.userId.toString() !== req.dbUser._id.toString()) {
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

export { createPost, getAllPosts, updatePost, deletePost };
