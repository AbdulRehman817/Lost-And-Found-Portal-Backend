const getUserProfile = async (req, res) => {
  try {
    const userId = req.auth?.userId; // updated from req.auth.id

    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch full user data from Clerk (optional)

    return res.status(200).json({
      message: "User profile fetched successfully",
      data: userId, // full Clerk user object
    });
  } catch (error) {
    console.log("❌ Error fetching user profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { getUserProfile };
