import express from "express";
import {
  signup,
  signin,
  getUserProfile,
  LogoutUser,
  refreshToken,
} from "../controllers/user.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", signup);
router.post("/login", signin);
router.post("/logout", LogoutUser);
router.post("/refreshToken", refreshToken);
router.get("/profile", authMiddleware, getUserProfile); // Apply middleware
export default router;
