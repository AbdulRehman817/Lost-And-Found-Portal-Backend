import express from "express";
import {
  removeConnection,
  getAcceptedRequests,
  rejectRequest,
  acceptRequest,
  sendRequest,
  getPendingRequests, // optional, if you add this controller
  checkConnectionStatus,
} from "../controllers/connection.controller.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Send a connection request
router.post("/connections/sendRequest", sendRequest);

// Accept a request
router.post("/connections/acceptRequest", acceptRequest);

// Reject a request
router.post("/connections/rejectRequest", rejectRequest);

// Get all accepted connections
router.get("/connections/getAcceptedRequests", getAcceptedRequests);

// Get all pending requests (optional)
router.get("/connections/getPendingRequests", getPendingRequests);

// Remove/unfriend
router.delete("/connections/removeConnection", requireAuth, removeConnection);

// Check connection status
router.get("/connections/status/:receiverId", checkConnectionStatus);

export default router;
