export const ensureVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "You must verify your email to perform this action",
    });
  }
  next();
};
