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
<<<<<<< HEAD
    profileImage: {
      type: String,
      default: "",
    },
=======
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
    email: {
      type: String,
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      default: "",
    },
    otp: { type: String }, // store current OTP
    otpExpiry: { type: Date }, // OTP expiration time
    isVerified: { type: Boolean, default: false }, // email verified
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
