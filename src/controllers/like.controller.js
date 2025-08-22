import { Like } from "../models/like.models.js";
import { Post } from "../models/post.models.js";

// ====================== createLike ====================== //
const createLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.dbUser._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let existingLike = await Like.findOne({ postId, userId });

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
    const newLike = await Like.create({ postId, userId, isLiked: true });

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
    const userId = req.dbUser._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const existingLike = await Like.findOne({ postId, userId });
    if (!existingLike || !existingLike.isLiked) {
      return res
        .status(400)
        .json({ message: "You haven't liked this post yet" });
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

// import { Like } from "../models/like.models.js";
// import { Post } from "../models/post.models.js";

// // TODO ====================== createLike ======================   //

// const createLike = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const userId = req.dbUser._id;

//     // ✅ Check if post exists
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     // ✅ Check if a like already exists
//     let existingLike = await Like.findOne({ postId, userId });

//     if (existingLike) {
//       if (existingLike.isLiked) {
//         return res
//           .status(400)
//           .json({ message: "You have already liked this post" });
//       } else {
//         // Soft-like: user previously unliked, now liking again
//         existingLike.isLiked = true;
//         await existingLike.save();

//         // Increment post's like count
//         post.likeCount = (post.likeCount || 0) + 1;
//         await post.save();

//         return res.status(200).json({
//           message: "Post liked successfully",
//           like: existingLike,
//         });
//       }
//     } else {
//       // ✅ No existing like, create new
//       const newLike = new Like({
//         postId,
//         userId,
//         isLiked: true,
//       });
//       await newLike.save();

//       // Increment post's like count
//       post.likeCount = (post.likeCount || 0) + 1;
//       await post.save();

//       return res.status(201).json({
//         message: "Post liked successfully",
//         like: newLike,
//       });
//     }
//   } catch (error) {
//     console.error("Error liking post:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// // TODO ====================== deleteLike ======================   //

// const deleteLike = async (req, res) => {
//   try {
//     const postId = req.params.id;
//     const userId = req.dbUser._id;

//     // ✅ Check if post exists
//     const post = await Post.findById(postId);
//     if (!post) {
//       return res.status(404).json({ message: "Post not found" });
//     }

//     // ✅ Find existing like
//     const existingLike = await Like.findOne({ postId, userId });
//     if (!existingLike || existingLike.isLiked === false) {
//       return res
//         .status(400)
//         .json({ message: "You have not liked this post yet" });
//     }

//     // ✅ Soft delete: set isLiked = false
//     existingLike.isLiked = false;
//     await existingLike.save();

//     // ✅ Update post's like count
//     if (post.likeCount && post.likeCount > 0) {
//       post.likeCount -= 1;
//       await post.save();
//     }

//     return res.status(200).json({
//       message: "Post unliked successfully",
//     });
//   } catch (error) {
//     console.error("Error unliking post:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//     });
//   }
// };

// // TODO ====================== getAllLikes ======================   //

// const getAllLikes = async (req, res) => {
//   const postId = req.params.id;
//   const likes = await Like.find({ postId }).populate("userId", "name email");
//   if (likes.length === 0) {
//     return res.status(404).json({ message: "No likes found for this post" });
//   }
//   res.status(200).json({
//     message: "Likes fetched successfully",
//     data: likes,
//   });
// };

// export { createLike, deleteLike, getAllLikes };
