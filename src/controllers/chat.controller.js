import { Chat } from "../models/chat.models.js";
import { User } from "../models/user.models.js";
import { Connection } from "../models/connection.models.js";

export const getMyProfile = async (req, res) => {
  const { userId } = req.auth;
  const dbUser = await User.findOne({ clerkId: userId }).select("-password");

  if (!dbUser)
    return res.status(404).json({ success: false, message: "User not found" });

  res.json({ success: true, user: dbUser });
};

export const sendMessage = async (req, res) => {
  const { userId } = req.auth;
  const { receiverId, message } = req.body;

  const dbUser = await User.findOne({ clerkId: userId });
  const senderId = dbUser._id;

  const newMessage = await Chat.create({
    senderId,
    receiverId,
    message,
    status: "sent",
  });

  // ✅ Emit through socket
  global.io.to(receiverId.toString()).emit("newMessage", newMessage);

  res.status(201).json({ success: true, data: newMessage });
};

export const getAllMessages = async (req, res) => {
  const { userId } = req.auth;
  const { receiverId } = req.params;

  const dbUser = await User.findOne({ clerkId: userId });
  const senderId = dbUser._id;

  await Chat.updateMany(
    { senderId: receiverId, receiverId: senderId, status: "sent" },
    { $set: { status: "seen" } }
  );

  const allMessages = await Chat.find({
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  }).sort({ createdAt: 1 });

  res.json({ success: true, allMessages, currentUserId: senderId });
};

export const getConnectedUsers = async (req, res) => {
  const { userId } = req.auth;
  const user = await User.findOne({ clerkId: userId });

  const connections = await Connection.find({
    status: "accepted",
    $or: [{ requesterId: user._id }, { receiverId: user._id }],
  })
    .populate("requesterId", "name profileImage isOnline")
    .populate("receiverId", "name profileImage isOnline");

  const connectedUsers = connections.map((c) =>
    c.requesterId._id.toString() === user._id.toString()
      ? c.receiverId
      : c.requesterId
  );

  res.json({ success: true, connectedUsers });
};
