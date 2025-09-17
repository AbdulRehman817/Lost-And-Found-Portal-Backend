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
router.post("/sendRequest", requireAuth, sendRequest);

// Accept a request
router.post("/acceptRequest", requireAuth, acceptRequest);

// Reject a request
router.post("/rejectRequest", requireAuth, rejectRequest);

// Get all accepted connections
router.get("/getConnections", requireAuth, getConnections);

// Get all pending requests (optional)
router.get("/getPendingRequests", requireAuth, getPendingRequests);

// Remove/unfriend
router.delete("/removeConnection", requireAuth, removeConnection);

export default router;
