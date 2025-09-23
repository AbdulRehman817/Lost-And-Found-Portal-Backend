import express from "express";
const router = express.Router();
import { getAllMessages, sendMessage } from "../controllers/chat.controller.js";
import { requireAuth } from "@clerk/express";

router.post("/chat/sendMessage", requireAuth, sendMessage);
router.get("/chat/getAllMessages", requireAuth, getAllMessages);
export default router;
