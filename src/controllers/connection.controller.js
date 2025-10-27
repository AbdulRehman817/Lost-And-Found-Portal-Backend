import { Connection } from "../models/connection.models.js";
import { User } from "../models/user.models.js";

const sendRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { receiverId, message } = req.body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const requesterId = dbUser._id;

    if (!receiverId) {
      return res
        .status(400)
        .json({ success: false, message: "Receiver ID is required." });
    }

    if (requesterId.toString() === receiverId.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot send request to yourself." });
    }

    const existing = await Connection.findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "pending") {
        return res
          .status(400)
          .json({ success: false, message: "Request already pending." });
      }
      if (existing.status === "accepted") {
        return res
          .status(400)
          .json({ success: false, message: "Already connected." });
      }
      if (existing.status === "rejected") {
        existing.status = "pending";
        existing.requesterId = requesterId;
        existing.receiverId = receiverId;
        if (message) existing.message = message;
        await existing.save();
        return res.status(200).json({
          success: true,
          message: "Request sent successfully.",
          data: existing,
        });
      }
    }

    const newRequest = await Connection.create({
      requesterId,
      receiverId,
      message,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Request sent successfully.",
      data: newRequest,
    });
  } catch (error) {
    console.error("Error sending request:", error);
    res.status(500).json({
      success: false,
      message: "Error sending request",
      error: error.message,
    });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { requesterId } = req.body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const receiverId = dbUser._id;

    if (!requesterId)
      return res.status(400).json({ message: "Requester ID is required." });

    const request = await Connection.findOne({
      requesterId,
      receiverId,
      status: "pending",
    });

    if (!request)
      return res.status(404).json({ message: "No pending request found." });

    request.status = "accepted";
    request.acceptedAt = new Date();
    await request.save();

    res.json({ success: true, message: "Request accepted.", data: request });
  } catch (error) {
    console.error("Error accepting request:", error);
    res
      .status(500)
      .json({ message: "Error accepting request", error: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { requesterId } = req.body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const receiverId = dbUser._id;

    if (!requesterId)
      return res.status(400).json({ message: "Requester ID is required." });

    const request = await Connection.findOne({
      requesterId,
      receiverId,
      status: "pending",
    });

    if (!request)
      return res.status(404).json({ message: "No pending request found." });

    request.status = "rejected";
    request.rejectedAt = new Date();
    await request.save();

    res.json({ success: true, message: "Request rejected.", data: request });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res
      .status(500)
      .json({ message: "Error rejecting request", error: error.message });
  }
};

const getAcceptedRequests = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const requests = await Connection.find({
      receiverId: dbUser._id,
      status: "accepted",
    }).populate("requesterId", "name email profileImage message");
    console.log("accepted request", requests);
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const requests = await Connection.find({
      receiverId: dbUser._id,
      status: "pending",
    }).populate("requesterId", "name email profileImage message");

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const requests = await Connection.find({
      requesterId: dbUser._id,
      status: "pending",
    }).populate("receiverId", "name email profileImage");

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.auth; // clerk id
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const requesterId = dbUser._id;
    const { receiverId } = req.params;

    // Find any connection doc between them
    const existingConnection = await Connection.findOne({
      $or: [
        { requesterId: requesterId, receiverId: receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (!existingConnection) {
      return res.status(200).json({
        success: true,
        isConnected: false,
        isPending: false,
      });
    }

    // connection exists - map DB status to flags
    const status = existingConnection.status; // pending / accepted / rejected
    if (status === "accepted") {
      return res.status(200).json({
        success: true,
        isConnected: true,
        isPending: false,
        status: "accepted",
      });
    } else if (status === "pending") {
      // Determine who sent the pending request (optional: return connectionId)
      const isRequester =
        existingConnection.requesterId.toString() === requesterId.toString();
      return res.status(200).json({
        success: true,
        isConnected: false,
        isPending: true,
        status: "pending",
        connectionId: existingConnection._id,
        amRequester: isRequester, // useful for frontend (to show Cancel only for requester)
      });
    } else {
      // rejected or other
      return res.status(200).json({
        success: true,
        isConnected: false,
        isPending: false,
        status: status,
      });
    }
  } catch (error) {
    console.error("Error checking connection status:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

const getConnectionCounts = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const userObjectId = dbUser._id;

    const acceptedCount = await Connection.countDocuments({
      status: "accepted",
      $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }],
    });

    const pendingReceivedCount = await Connection.countDocuments({
      receiverId: userObjectId,
      status: "pending",
    });

    const pendingSentCount = await Connection.countDocuments({
      requesterId: userObjectId,
      status: "pending",
    });

    const rejectedCount = await Connection.countDocuments({
      $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }],
      status: "rejected",
    });

    res.json({
      success: true,
      data: {
        acceptedCount,
        pendingReceivedCount,
        pendingSentCount,
        rejectedCount,
        totalConnections:
          acceptedCount +
          pendingReceivedCount +
          pendingSentCount +
          rejectedCount,
      },
    });
  } catch (error) {
    console.error("Error getting connection counts:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { receiverId } = req.body; // caller provides the receiverId of the pending request to cancel

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const requesterId = dbUser._id;

    if (!receiverId)
      return res
        .status(400)
        .json({ success: false, message: "Receiver ID is required." });

    // Find pending request where current user is the requester
    const request = await Connection.findOneAndDelete({
      requesterId,
      receiverId,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ success: false, message: "Pending request not found." });
    }

    res.json({ success: true, message: "Request cancelled successfully." });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling request",
      error: error.message,
    });
  }
};

export {
  removeConnection,
  getAcceptedRequests,
  rejectRequest,
  acceptRequest,
  sendRequest,
  cancelRequest,
  getSentRequests,
  getPendingRequests,
  checkConnectionStatus,
  getConnectionCounts,
};
