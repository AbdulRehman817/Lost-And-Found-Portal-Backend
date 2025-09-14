import express from "express";
import {
  getUserProfile,
  updateUserProfile,
<<<<<<< HEAD
  syncClerkUser, // 👈 import
=======
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c
} from "../controllers/user.controllers.js";
import { requireAuth } from "@clerk/express";

const router = express.Router();

<<<<<<< HEAD
// Protect routes with Clerk + also sync user into Mongo
router.get("/profile", requireAuth(), syncClerkUser, getUserProfile);
router.put("/profile", requireAuth(), syncClerkUser, updateUserProfile);
=======
// Clerk handles auth, so just protect endpoints with requireAuth
router.get("/profile", requireAuth(), getUserProfile);
router.put("/profile", requireAuth(), updateUserProfile);
>>>>>>> c98c04b94a323ab741b146da6f3eb122c98e203c

export default router;
