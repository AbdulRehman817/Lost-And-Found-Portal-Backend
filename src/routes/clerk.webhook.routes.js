import express from "express";
import { User } from "../models/user.models.js";

const router = express.Router();

router.post("/clerk", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const payload = req.body;
    const eventType = payload.type;
    const clerkUser = payload.data;

    console.log("📩 Clerk Webhook Event:", eventType);

    // ✅ Handle user creation or update
    if (eventType === "user.created" || eventType === "user.updated") {
      const name =
        `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() ||
        clerkUser.username ||
        "Unknown User";

      const email =
        clerkUser.email_addresses?.[0]?.email_address || "no-email@clerk.com";

      const profileImage = clerkUser.image_url || null;

      // ✅ Upsert user data (create or update)
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        {
          clerkId: clerkUser.id,
          name,
          email,
          profileImage,
          lastSynced: new Date(), // optional: track sync time
        },
        { upsert: true, new: true }
      );

      console.log("✅ User synced:", updatedUser.name);
    }

    // ✅ Handle user deletion
    if (eventType === "user.deleted") {
      const deletedId = clerkUser.id;
      await User.findOneAndDelete({ clerkId: deletedId });
      console.log(`🗑️ Deleted user with Clerk ID: ${deletedId}`);
    }

    // ✅ Send success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Clerk Webhook Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

export default router;

