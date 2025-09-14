/**
 * Middleware: ensureVerified
 * ---------------------------
 * Protects routes from unverified users (email not OTP verified).
 *
 * Requirements:
 *  - Runs **after** `ensureUser`, so `req.dbUser` is available
 *  - `User.isVerified` must be true to access the route
 */
export const ensureVerified = (req, res, next) => {
  try {
    const user = req.dbUser;

    // 🔒 User must be attached via ensureUser
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // ❌ Deny access if not verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Access denied. Please verify your email to continue.",
      });
    }

    // ✅ All good — allow access
    next();
  } catch (error) {
    console.error("❌ ensureVerified middleware error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// // middlewares/isVerified.js

// /**
//  * Middleware: isVerified
//  * -----------------------
//  * Ensures that the user attached to the request (via ensureUser middleware)
//  * has verified their email. Protects routes from unverified users.
//  *
//  * Usage:
//  *  - ensureUser must run before this middleware to attach req.dbUser
//  *  - Use on any route that requires email verification
//  */
// export const ensureVerified = (req, res, next) => {
//   try {
//     // 🔗 Get the MongoDB user from the request
//     const user = req.dbUser; // ensureUser middleware must have run before this

//     // ❌ If user not found (shouldn't normally happen)
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // ❌ Check if user has verified their email
//     if (!user.isVerified) {
//       return res.status(403).json({
//         message: "Your email is not verified. Please verify to proceed.",
//       });
//     }

//     // ✅ User exists and is verified — allow access to the route
//     next();
//   } catch (error) {
//     console.error("Error in isVerified middleware:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
