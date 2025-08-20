import { User } from "../models/user.models.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

/**
 * Middleware: ensureUser
 * -----------------------
 * Ensures that the incoming request has a valid Clerk user ID
 * and that this user exists in MongoDB. If the user does not exist,
 * it will create a new MongoDB user record using Clerk details.
 *
 * After execution, `req.dbUser` will contain the MongoDB user object.
 **/
export const ensureUser = async (req, res, next) => {
  try {
    //**  🔑 Get Clerk userId from the authenticated request
    const clerkId = req.auth?.userId;

    // !❌ Unauthorized if no Clerk ID
    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔍 Check if user already exists in MongoDB
    let user = await User.findOne({ clerkId });

    //** ⚡ If user doesn't exist, fetch details from Clerk and create a new Mongo user
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);

      user = await User.create({
        clerkId: clerkUser.id,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: clerkUser.emailAddresses[0].emailAddress,
        bio: "", // Default empty bio
      });

      // ✅ Log new user creation
      console.log("✅ New Mongo user created:", user._id);
    }

    // 🔗 Attach the MongoDB user to the request for use in subsequent controllers
    req.dbUser = user;

    // ▶ Proceed to next middleware/controller
    next();
  } catch (error) {
    console.error("❌ ensureUser middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
