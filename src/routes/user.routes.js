import express from "express";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/user.controllers.js";
import { requireAuth } from "@clerk/express";
import { ensureUser } from "../middleware/ensureUser.js";
import { ensureVerified } from "../middleware/ensureVerified.middleware.js";

const router = express.Router();

//**  Clerk handles register/login/logout via its SDK on the frontend */
//**  You only keep protected endpoints in your backend  */

router.get("/profile", requireAuth, ensureUser, ensureVerified, getUserProfile);
router.put("/profile", requireAuth, ensureUser, updateUserProfile);

export default router;
