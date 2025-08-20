// middlewares/isVerified.js
export const isVerified = (req, res, next) => {
  try {
    const user = req.dbUser; // ensureUser must run before this

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Your email is not verified. Please verify to proceed.",
      });
    }

    // ✅ User is verified, allow access
    next();
  } catch (error) {
    console.error("Error in isVerified middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
