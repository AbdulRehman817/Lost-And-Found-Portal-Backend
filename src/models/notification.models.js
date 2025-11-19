import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: { type: String, enum: ["comment"], required: true },

    message: { type: String, required: true },

    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },

    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
