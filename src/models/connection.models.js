import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
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
      type: String, // ✅ Changed from Boolean to String
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      required: true,
    },
    // Optional: Add these fields to track when actions happened
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Compound index to prevent duplicate requests between same users
connectionSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });

// ✅ Add indexes for better query performance
connectionSchema.index({ receiverId: 1, status: 1 }); // For finding pending requests for a user
connectionSchema.index({ requesterId: 1, status: 1 }); // For finding sent requests by a user

export const Connection = mongoose.model("Connection", connectionSchema);
