import { Connection } from "../models/connection.models.js";
import { User } from "../models/user.models.js";

const sendRequest = async (req, res) => {
  try {
    const { userId } = req.auth; // Fixed: removed parentheses - should be req.auth not req.auth()
    const { receiverId } = req.body;

    // Find MongoDB user using Clerk ID
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requesterId = dbUser._id; // MongoDB ObjectId

    // Validate receiverId
    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required." });
    }

    // Prevent self-connection
    if (requesterId.toString() === receiverId.toString()) {
      // Fixed: compare requesterId not userId
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself." });
    }

    const existing = await Connection.findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({ message: "Request already pending." });
      }
      if (existing.status === "accepted") {
        return res.status(400).json({ message: "Already connected." });
      }
      if (existing.status === "rejected") {
        // Allow new request after rejection
        existing.status = "pending";
        existing.requesterId = requesterId;
        existing.receiverId = receiverId;
        await existing.save();
        return res.status(200).json({
          success: true,
          message: "Request sent successfully.",
          data: existing,
        });
      }
    } else {
      const newRequest = await Connection.create({
        requesterId, // Fixed: was using userId instead of requesterId
        receiverId, // Fixed: was using userId instead of receiverId
        status: "pending",
      });

      res.status(201).json({
        success: true,
        message: "Request sent successfully.",
        data: newRequest,
      });
    }
  } catch (error) {
    console.error("Error sending request:", error);
    res
      .status(500)
      .json({ message: "Error sending request", error: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { userId } = req.auth; // Fixed: removed parentheses
    const { requesterId } = req.body; // Fixed: was "recieverId" (typo)

    // Find MongoDB user using Clerk ID
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const receiverId = dbUser._id; // Current user's MongoDB ObjectId

    if (!requesterId) {
      return res.status(400).json({ message: "Requester ID is required." });
    }

    // Find pending request where current user is the receiver
    const request = await Connection.findOne({
      requesterId,
      receiverId, // Fixed: was using userId instead of receiverId
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "No pending request found." });
    }

    // Accept the request
    request.status = "accepted";
    request.acceptedAt = new Date(); // Add timestamp
    await request.save();

    res.json({
      success: true,
      message: "Request accepted.",
      data: request,
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    res
      .status(500)
      .json({ message: "Error accepting request", error: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { userId } = req.auth; // Fixed: removed parentheses
    const { requesterId } = req.body;

    // Find MongoDB user using Clerk ID
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const receiverId = dbUser._id; // Current user's MongoDB ObjectId

    if (!requesterId) {
      return res.status(400).json({ message: "Requester ID is required." });
    }

    // Find pending request where current user is the receiver
    const request = await Connection.findOne({
      requesterId,
      receiverId, // Fixed: was using userId instead of receiverId
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({ message: "No pending request found." });
    }

    // Reject the request
    request.status = "rejected";
    request.rejectedAt = new Date(); // Add timestamp
    await request.save();

    res.json({
      success: true,
      message: "Request rejected.",
      data: request,
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res
      .status(500)
      .json({ message: "Error rejecting request", error: error.message });
  }
};

const getConnections = async (req, res) => {
  try {
    const { userId } = req.auth; // Fixed: removed parentheses

    // Find MongoDB user using Clerk ID
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = dbUser._id;

    const connections = await Connection.find({
      $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }], // Fixed: use userObjectId
      status: "accepted",
    }).populate("requesterId receiverId", "name email profileImage"); // Fixed: use profileImage

    res.json({
      success: true,
      data: connections,
    });
  } catch (error) {
    console.error("Error fetching connections:", error);
    res
      .status(500)
      .json({ message: "Error fetching connections", error: error.message });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.auth(); // Fixed: removed parentheses

    // Find MongoDB user using Clerk ID
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = dbUser._id;

    const requests = await Connection.find({
      receiverId: userObjectId, // Fixed: use userObjectId
      status: "pending",
    }).populate("requesterId", "name email profileImage"); // Fixed: use profileImage
    console.log("request pending", requests);
    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      message: "Error fetching pending requests",
      error: error.message,
    });
  }
};

const removeConnection = async (req, res) => {
  try {
    const { userId } = req.auth; // Fixed: removed parentheses
    const { connectionId } = req.body;

    // Find MongoDB user using Clerk ID
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = dbUser._id;

    if (!connectionId) {
      return res.status(400).json({ message: "Connection ID is required." });
    }

    const connection = await Connection.findOneAndDelete({
      _id: connectionId,
      $or: [
        { requesterId: userObjectId, status: "accepted" }, // Fixed: use userObjectId
        { receiverId: userObjectId, status: "accepted" }, // Fixed: use userObjectId
      ],
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found." });
    }

    res.json({
      success: true,
      message: "Connection removed successfully.",
    });
  } catch (error) {
    console.error("Error removing connection:", error);
    res
      .status(500)
      .json({ message: "Error removing connection", error: error.message });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const { userId } = req.auth; // Fixed: removed parentheses

    // Find MongoDB user using Clerk ID
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = dbUser._id;

    const requests = await Connection.find({
      requesterId: userObjectId, // Fixed: use userObjectId
      status: "pending",
    }).populate("receiverId", "name email profileImage"); // Fixed: use profileImage

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res
      .status(500)
      .json({ message: "Error fetching sent requests", error: error.message });
  }
};

export {
  removeConnection,
  getConnections,
  rejectRequest,
  acceptRequest,
  sendRequest,
  getSentRequests,
};
