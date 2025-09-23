import mongoose from "mongoose";
const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["sent", "seen"],
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
