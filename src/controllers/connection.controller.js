import { Connection } from "../models/connection.models.js";
import { User } from "../models/user.models.js";

const sendRequest = async (req, res) => {
  try {
    const { requesterId } = req.auth()._id;
    const { receiverId } = req.body;
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
        return res.status(400).json({ message: "Request accepted." });
      }
      if (existing.status === "rejected") {
        return res.status(400).json({ message: "Request rejected." });
      }
    } else {
      const newRequest = await Connection.create({
        requesterId,
        receiverId,
        status: "pending",
      });
    }
    res.status(201).json({ message: "Request sent successfully.", newRequest });
  } catch (error) {
    res.status(500).json({ message: "Error sending request", error });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { requesterId } = req.auth()._id;
    const { receiverId } = req.body;

    const request = Connection.findOne({
      requesterId,
      receiverId,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ message: "No pending request found." });
    } else {
      request.status === "accepted";
      await request.save();
      res.json({ message: "Request accepted.", request });
    }
  } catch (error) {
    res.status(500).json({ message: "Error accepting request", error });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const { requesterId } = req.auth()._id;
    const { receiverId } = req.body;

    const request = Connection.findOne({
      requesterId,
      receiverId,
      status: "pending",
    });
    if (!request) {
      return res.status(404).json({ message: "No pending request found." });
    } else {
      request.status === "rejected";
      await request.save();
      res.json({ message: "Request rejected.", request });
    }
  } catch (error) {
    res.status(500).json({ message: "Error accepting request", error });
  }
};

const getConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ requesterId: userId }, { receiverId: userId }],
      status: "accepted",
    }).populate("requesterId receiverId", "name email"); // populate user info

    res.json(connections);
  } catch (error) {
    res.status(500).json({ message: "Error fetching connections", error });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await Connection.find({
      receiverId: userId,
      status: "pending",
    }).populate("requesterId", "name email");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending requests", error });
  }
};

const removeConnection = async (req, res) => {
  try {
    const userId = req.user._id;
    const { receiverId } = req.body;

    const connection = await Connection.findOneAndDelete({
      $or: [
        { requesterId: userId, receiverId: receiverId, status: "accepted" },
        { requesterId: receiverId, receiverId: userId, status: "accepted" },
      ],
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found." });
    }

    res.json({ message: "Connection removed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error removing connection", error });
  }
};

export {
  removeConnection,
  getConnections,
  rejectRequest,
  acceptRequest,
  sendRequest,
};
