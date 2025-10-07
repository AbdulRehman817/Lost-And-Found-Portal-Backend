import express from "express";
const router = express.Router();
import {
  getAllMessages,
  getConnectedUsers,
  sendMessage,
} from "../controllers/chat.controller.js";
import { requireAuth } from "@clerk/express";

router.post("/sendMessage", requireAuth(), sendMessage);
router.get("/getAllMessages", requireAuth(), getAllMessages);
router.get("/connected-users", requireAuth(), getConnectedUsers);
export default router;
