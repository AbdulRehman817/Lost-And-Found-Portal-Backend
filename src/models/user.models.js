import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    clerkId: {
      type: String,
      required: true,
      unique: true, // Clerk’s unique ID for every user
    },
    profileImage: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      default: "",
    },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
