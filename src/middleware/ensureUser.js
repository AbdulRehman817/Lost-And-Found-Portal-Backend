import { User } from "../models/user.models.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const ensureUser = async (req, res, next) => {
  try {
    const clerkId = req.auth?.userId; // Clerk userId

    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user already exists in MongoDB
    let user = await User.findOne({ clerkId });

    if (!user) {
      // If not, fetch details from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkId);

      // Create a new Mongo user
      user = await User.create({
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0].emailAddress,
        bio: "", // default
      });

      console.log("✅ New Mongo user created:", user._id);
    }

    // Attach user to request (optional)
    req.dbUser = user;

    next();
  } catch (error) {
    console.error("❌ ensureUser middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
