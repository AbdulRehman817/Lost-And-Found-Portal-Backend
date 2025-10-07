import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.models.js";
import { Connection } from "../models/connection.models.js";
export const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth; // assuming Clerk adds this
    const { receiverId, message } = req.body;

    // 1. Check if logged in user exists
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const senderId = dbUser._id;

    // 2. Validate inputs
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required.",
      });
    }

    // 3. Create a new chat message
    const newMessage = await Chat.create({
      senderId,
      receiverId,
      message,
      status: "sent", // default status when sending
      createdAt: new Date(),
    });

    // 4. Send response back
    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { userId } = req.auth; // Clerk gives this
    const { receiverId } = req.body;

    // 1. Check if logged-in user exists
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const senderId = dbUser._id;

    // 2. Validate inputs
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required.",
      });
    }

    // 3. Mark all "sent" messages (to the logged-in user) as "seen"
    await Chat.updateMany(
      {
        senderId: receiverId,
        receiverId: senderId,
        status: "sent",
      },
      { $set: { status: "seen" } }
    );

    // 4. Fetch all messages between the two users
    const allMessages = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "All messages fetched.",
      allMessages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

export const getConnectedUsers = async (req, res) => {
  try {
    // Get logged in user's MongoDB ID from Clerk
    const { userId } = req.auth;

    // Find user from MongoDB
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Find accepted connections
    const connections = await Connection.find({
      status: "accepted",
      $or: [{ requesterId: user._id }, { receiverId: user._id }],
    })
      .populate("requesterId", "name profileImage isOnline")
      .populate("receiverId", "name profileImage isOnline");

    // Get connected users
    const connectedUsers = connections.map((c) => {
      const otherUser =
        c.requesterId._id.toString() === user._id.toString()
          ? c.receiverId
          : c.requesterId;

      return {
        _id: otherUser._id, // ✅ only MongoDB ID
        name: otherUser.name,
        profileImage: otherUser.profileImage,
        isOnline: otherUser.isOnline,
      };
    });

    res.json({ success: true, connectedUsers });
  } catch (err) {
    console.error("Error fetching connected users:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
