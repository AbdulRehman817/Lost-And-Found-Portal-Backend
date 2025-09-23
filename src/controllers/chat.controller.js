import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.models.js";

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
