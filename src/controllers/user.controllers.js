// controllers/userController.js
import { clerkClient } from "@clerk/clerk-sdk-node";
import { User } from "../models/user.models.js";

<<<<<<< HEAD
// ✅ Middleware: Sync Clerk user into MongoDB if not exists
const syncClerkUser = async (req, res, next) => {
  try {
    if (!req.auth?.userId) return next();

    const clerkId = req.auth.userId;
    let existingUser = await User.findOne({ clerkId });

    if (!existingUser) {
      // Fetch Clerk user details
      const clerkUser = await clerkClient.users.getUser(clerkId);

      const name =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        clerkUser.username ||
        "Unknown User";

      const email =
        clerkUser.emailAddresses?.[0]?.emailAddress || "no-email@clerk.com";

      const profileImage = clerkUser.imageUrl || null;

      existingUser = await User.create({
        clerkId,
        name,
        email,
        profileImage,
      });
    }

    // attach Mongo user to request for later use
    req.dbUser = existingUser;
    next();
  } catch (err) {
    console.error("❌ syncClerkUser error:", err);
    next(err);
  }
};

// ✅ Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.auth;

    // Try to fetch from Mongo
    let dbUser = await User.findOne({ clerkId: userId });

    // If not found, fetch from Clerk and create in Mongo
    if (!dbUser) {
      const clerkUser = await clerkClient.users.getUser(userId);

      dbUser = await User.create({
        clerkId: userId,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        profileImage: clerkUser.imageUrl || "",
=======
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
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
        isVerified:
          clerkUser.emailAddresses[0]?.verification?.status === "verified",
      });
    }

<<<<<<< HEAD
    const initials = dbUser.name
      ? dbUser.name.charAt(0).toUpperCase()
      : dbUser.email.charAt(0).toUpperCase();

    return res.status(200).json({
      message: "User profile fetched successfully",
      data: {
        ...dbUser.toObject(),
        initials,
      },
=======
    return res.status(200).json({
      message: "User profile fetched successfully",
      data: dbUser,
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

<<<<<<< HEAD
// ✅ Update User Profile
=======
// Update User Profile
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { name, bio } = req.body;

    let dbUser = await User.findOne({ clerkId: userId });
<<<<<<< HEAD
=======

>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

<<<<<<< HEAD
    // Update MongoDB user
=======
    // Update fields in MongoDB
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
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

<<<<<<< HEAD
export { getUserProfile, updateUserProfile, syncClerkUser };
=======
export { getUserProfile, updateUserProfile };
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
