import express from "express";
import {
  removeConnection,
  getConnections,
  rejectRequest,
  acceptRequest,
  sendRequest,
  getPendingRequests, // optional, if you add this controller
} from "../controllers/connection.controller.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

// Send a connection request
router.post("/connections/sendRequest", sendRequest);

// Accept a request
router.post("/connections/acceptRequest", requireAuth, acceptRequest);

// Reject a request
router.post("/connections/rejectRequest", requireAuth, rejectRequest);

// Get all accepted connections
router.get("/connections/getConnections", requireAuth, getConnections);

// Get all pending requests (optional)
router.get("/connections/getPendingRequests", requireAuth, getPendingRequests);

// Remove/unfriend
router.delete("/connections/removeConnection", requireAuth, removeConnection);

export default router;
