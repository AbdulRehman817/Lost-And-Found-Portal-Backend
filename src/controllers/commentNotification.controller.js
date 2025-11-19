import { Notification } from "../models/notification.models.js";
import { User } from "../models/user.models.js";

export const getCommentNotifications = async (req, res) => {
  try {
    const clerkId = req.auth.userId;

    if (!clerkId)
      return res.status(401).json({ success: false, error: "Unauthorized" });

    // Find DB user
    const user = await User.findOne({ clerkId });
    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    const notifications = await Notification.find({
      userId: user._id,
      type: "comment",
    })
      .populate("fromUser", "name profileImage")
      .populate("postId", "content")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching comment notifications:", error);
    res
      .status(500)
      .json({ success: false, error: "Server error. Try again later." });
  }
};
