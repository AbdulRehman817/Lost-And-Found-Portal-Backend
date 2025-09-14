// routes/clerkWebhook.js
import { User } from "../models/user.models.js";
import express from "express";

const router = express.Router();

router.post("/clerk", express.json({ type: "*/*" }), async (req, res) => {
  try {
    const payload = req.body;
    const eventType = payload.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const clerkUser = payload.data;

      const name =
        `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() ||
        clerkUser.username ||
        "Unknown User";

      const email =
        clerkUser.email_addresses?.[0]?.email_address || "no-email@clerk.com";

      const profileImage = clerkUser.image_url || null;

      await User.findOneAndUpdate(
        { clerkId: clerkUser.id },
        {
          clerkId: clerkUser.id,
          name,
          email,
          profileImage, // ✅ store Clerk profile image
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Clerk webhook error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
