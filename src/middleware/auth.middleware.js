import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token found" });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    console.log("🛡️ Token received:", token);

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_JWT_SECRET);
    console.log("✅ Token verified:", decoded);

    // 3. Find user from token payload
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("❌ Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
