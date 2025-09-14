import mongoose from "mongoose";

const likeScheme = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isLiked: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
export const Like = mongoose.model("Like", likeScheme);
