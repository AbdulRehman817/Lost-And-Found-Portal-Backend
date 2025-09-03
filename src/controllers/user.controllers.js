// controllers/userController.js
import { clerkClient } from "@clerk/clerk-sdk-node";
import { User } from "../models/user.models.js";

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.auth; // Clerk middleware injects this
    const clerkUser = await clerkClient.users.getUser(userId);

    // Check in MongoDB
    let dbUser = await User.findOne({ clerkId: userId });

    // If not found, create in DB
    if (!dbUser) {
      dbUser = await User.create({
        clerkId: userId,
        name: clerkUser.firstName || "",
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        isVerified:
          clerkUser.emailAddresses[0]?.verification?.status === "verified",
      });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      data: dbUser,
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { name, bio } = req.body;

    let dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields in MongoDB
    dbUser.name = name || dbUser.name;
    dbUser.bio = bio || dbUser.bio;

    await dbUser.save();

    res.status(200).json({
      message: "User updated successfully",
      data: dbUser,
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { getUserProfile, updateUserProfile };
