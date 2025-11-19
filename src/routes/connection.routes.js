import express from "express";
import {
  removeConnection,
  getAcceptedRequests,
  rejectRequest,
  acceptRequest,
  cancelRequest,
  sendRequest,
  getSentRequests,
  getMyConnections,
  getPendingRequests,
  checkConnectionStatus,
  getConnectionCounts,
} from "../controllers/connection.controller.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// 🔐 Send a connection request (auth required)
router.post("/connections/sendRequest", requireAuth(), sendRequest);

// 🔐 Accept a request (auth required)
router.post("/connections/acceptRequest", requireAuth(), acceptRequest);

// 🔐 Reject a request (auth required)
router.post("/connections/rejectRequest", requireAuth(), rejectRequest);

// 🔐 Cancel a pending request you sent (auth required)
router.post("/connections/cancelRequest", requireAuth(), cancelRequest);

// 🔐 Get all pending requests you received (auth required)
router.get(
  "/connections/getPendingRequests",
  requireAuth(),
  getPendingRequests
);

// 🔐 Get all accepted requests you received (auth required)
router.get(
  "/connections/getAcceptedRequests",
  requireAuth(),
  getAcceptedRequests
);

// 🔐 Get all pending requests you sent (auth required)
router.get("/connections/getSentRequests", requireAuth(), getSentRequests);

// 🔐 Get all your connections - bidirectional (auth required)
router.get("/connections/getMyConnections", requireAuth(), getMyConnections);

// 🔐 Check connection status with a specific user (auth required)
router.get(
  "/connections/status/:receiverId",
  requireAuth(),
  checkConnectionStatus
);

// 🔐 Get connection counts/statistics (auth required)
router.get("/connections/counts", requireAuth(), getConnectionCounts);

// 🔐 Remove/unfriend a connection (auth required)
router.delete("/connections/removeConnection", requireAuth(), removeConnection);

export default router;
