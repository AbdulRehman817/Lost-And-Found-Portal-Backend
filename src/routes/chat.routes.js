import express from "express";
import { requireAuth } from "@clerk/express";
import {
  sendMessage,
  getAllMessages,
  getConnectedUsers,
  getMyProfile,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/me", requireAuth(), getMyProfile); // ✅ Fixes 404
router.get("/messages/:receiverId", requireAuth(), getAllMessages);
router.post("/send", requireAuth(), sendMessage);
router.get("/connected-users", requireAuth(), getConnectedUsers);

export default router;
