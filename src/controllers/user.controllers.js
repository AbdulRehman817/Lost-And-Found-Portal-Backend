// getUserProfile
const getUserProfile = async (req, res) => {
  return res.status(200).json({
    message: "User profile fetched successfully",
    data: req.dbUser, // directly from middleware
  });
};

// updateUserProfile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    const user = req.dbUser; // from middleware

    user.name = name || user.name;
    user.email = email || user.email;
    user.bio = bio || user.bio;

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export { getUserProfile, updateUserProfile };
