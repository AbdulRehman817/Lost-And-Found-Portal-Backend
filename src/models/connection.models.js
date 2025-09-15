import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: Boolean,
    enum: ["pending", "accepted", "rejected"],
    required: true,
  },
});
export const Comment = mongoose.model("Comment", commentSchema);
