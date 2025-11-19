import { Connection } from "../models/connection.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

// ====================== sendRequest ====================== //
const sendRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { receiverId, message } = req.body;

    // Find sender user
    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requesterId = dbUser._id;

    // Validate receiverId
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // Validate receiverId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    // Prevent self-connection
    if (requesterId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send request to yourself",
      });
    }

    // Verify receiver exists
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Check for existing connection
    const existing = await Connection.findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "pending") {
        return res.status(400).json({
          success: false,
          message: "Request already pending",
        });
      }
      if (existing.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "Already connected",
        });
      }
      if (existing.status === "rejected") {
        // Allow new request after rejection
        existing.status = "pending";
        existing.requesterId = requesterId;
        existing.receiverId = receiverId;
        existing.message = message || "";
        existing.rejectedAt = null;
        await existing.save();

        await existing.populate("receiverId", "name email profileImage");

        return res.status(200).json({
          success: true,
          message: "Request sent successfully",
          data: existing,
        });
      }
    }

    // Create new connection request
    const newRequest = await Connection.create({
      requesterId,
      receiverId,
      message: message || "",
      status: "pending",
    });

    await newRequest.populate("receiverId", "name email profileImage");

    res.status(201).json({
      success: true,
      message: "Request sent successfully",
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

// ====================== acceptRequest ====================== //
const acceptRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { requesterId } = req.body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const receiverId = dbUser._id;

    if (!requesterId) {
      return res.status(400).json({
        success: false,
        message: "Requester ID is required",
      });
    }

    const request = await Connection.findOne({
      requesterId,
      receiverId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No pending request found",
      });
    }

    request.status = "accepted";
    request.acceptedAt = new Date();
    await request.save();

    await request.populate("requesterId", "name email profileImage");

    res.json({
      success: true,
      message: "Request accepted",
      data: request,
      notification: {
        type: "connection_accepted",
        message: `${dbUser.name} accepted your connection request`,
        from: dbUser._id,
        to: requesterId,
      },
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({
      success: false,
      message: "Error accepting request",
      error: error.message,
    });
  }
};

// ====================== rejectRequest ====================== //
const rejectRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { requesterId } = req.body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const receiverId = dbUser._id;

    if (!requesterId) {
      return res.status(400).json({
        success: false,
        message: "Requester ID is required",
      });
    }

    const request = await Connection.findOne({
      requesterId,
      receiverId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No pending request found",
      });
    }

    request.status = "rejected";
    request.rejectedAt = new Date();
    await request.save();

    res.json({
      success: true,
      message: "Request rejected",
      data: request,
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({
      success: false,
      message: "Error rejecting request",
      error: error.message,
    });
  }
};

// ====================== getPendingRequests ====================== //
const getPendingRequests = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requests = await Connection.find({
      receiverId: dbUser._id,
      status: "pending",
    })
      .populate("requesterId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching pending requests",
      error: error.message,
    });
  }
};

// ====================== getSentRequests ====================== //
const getSentRequests = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requests = await Connection.find({
      requesterId: dbUser._id,
      status: "pending",
    })
      .populate("receiverId", "name email profileImage")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching sent requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sent requests",
      error: error.message,
    });
  }
};

// ====================== getMyConnections ====================== //
const getMyConnections = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = dbUser._id;

    // Find all accepted connections
    const connections = await Connection.find({
      status: "accepted",
      $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }],
    })
      .populate("requesterId", "name email profileImage")
      .populate("receiverId", "name email profileImage")
      .sort({ acceptedAt: -1 });

    // Format response to show the "other" user
    const formattedConnections = connections.map((conn) => {
      const isRequester =
        conn.requesterId._id.toString() === userObjectId.toString();
      const otherUser = isRequester ? conn.receiverId : conn.requesterId;

      return {
        _id: conn._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          email: otherUser.email,
          profileImage: otherUser.profileImage,
        },
        acceptedAt: conn.acceptedAt,
        wasRequester: isRequester,
        message: conn.message,
        isNewConnection:
          new Date() - new Date(conn.acceptedAt) < 24 * 60 * 60 * 1000,
      };
    });

    res.json({
      success: true,
      totalConnections: formattedConnections.length,
      data: formattedConnections,
    });
  } catch (error) {
    console.error("Error getting connections:", error);
    res.status(500).json({
      success: false,
      message: "Error getting connections",
      error: error.message,
    });
  }
};

// ====================== getAcceptedRequests ====================== //
// Note: This returns requests YOU received that were accepted
const getAcceptedRequests = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requests = await Connection.find({
      receiverId: dbUser._id,
      status: "accepted",
    })
      .populate("requesterId", "name email profileImage")
      .sort({ acceptedAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching accepted requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching accepted requests",
      error: error.message,
    });
  }
};

// ====================== checkConnectionStatus ====================== //
const checkConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { receiverId } = req.params;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requesterId = dbUser._id;

    // Validate receiverId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid receiver ID",
      });
    }

    // Find connection between users
    const existingConnection = await Connection.findOne({
      $or: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId },
      ],
    });

    if (!existingConnection) {
      return res.status(200).json({
        success: true,
        isConnected: false,
        isPending: false,
        status: null,
      });
    }

    const status = existingConnection.status;

    if (status === "accepted") {
      return res.status(200).json({
        success: true,
        isConnected: true,
        isPending: false,
        status: "accepted",
        connectionId: existingConnection._id,
      });
    }

    if (status === "pending") {
      const isRequester =
        existingConnection.requesterId.toString() === requesterId.toString();
      return res.status(200).json({
        success: true,
        isConnected: false,
        isPending: true,
        status: "pending",
        connectionId: existingConnection._id,
        amRequester: isRequester,
      });
    }

    // rejected or other status
    return res.status(200).json({
      success: true,
      isConnected: false,
      isPending: false,
      status: status,
    });
  } catch (error) {
    console.error("Error checking connection status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ====================== getConnectionCounts ====================== //
const getConnectionCounts = async (req, res) => {
  try {
    const { userId } = req.auth;
    const dbUser = await User.findOne({ clerkId: userId });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = dbUser._id;

    const [
      acceptedCount,
      pendingReceivedCount,
      pendingSentCount,
      rejectedCount,
    ] = await Promise.all([
      Connection.countDocuments({
        status: "accepted",
        $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }],
      }),
      Connection.countDocuments({
        receiverId: userObjectId,
        status: "pending",
      }),
      Connection.countDocuments({
        requesterId: userObjectId,
        status: "pending",
      }),
      Connection.countDocuments({
        $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }],
        status: "rejected",
      }),
    ]);

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
    res.status(500).json({
      success: false,
      message: "Error getting connection counts",
      error: error.message,
    });
  }
};

// ====================== cancelRequest ====================== //
const cancelRequest = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { receiverId } = req.body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requesterId = dbUser._id;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    const request = await Connection.findOneAndDelete({
      requesterId,
      receiverId,
      status: "pending",
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Pending request not found",
      });
    }

    res.json({
      success: true,
      message: "Request cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling request:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling request",
      error: error.message,
    });
  }
};

// ====================== removeConnection ====================== //
const removeConnection = async (req, res) => {
  try {
    const { userId } = req.auth;
    const { connectionId } = req.body;

    const dbUser = await User.findOne({ clerkId: userId });
    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userObjectId = dbUser._id;

    if (!connectionId) {
      return res.status(400).json({
        success: false,
        message: "Connection ID is required",
      });
    }

    // Validate connectionId
    if (!mongoose.Types.ObjectId.isValid(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection ID",
      });
    }

    const connection = await Connection.findOneAndDelete({
      _id: connectionId,
      status: "accepted",
      $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }],
    });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found or already removed",
      });
    }

    res.json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Error removing connection:", error);
    res.status(500).json({
      success: false,
      message: "Error removing connection",
      error: error.message,
    });
  }
};

export {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getPendingRequests,
  getSentRequests,
  getMyConnections,
  getAcceptedRequests,
  checkConnectionStatus,
  getConnectionCounts,
  cancelRequest,
  removeConnection,
};
