import { User } from "../models/user.models";

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

const updateUserId = (req, res) => {
  const userId = req.auth.userId;
  const { name, email, bio } = req.body;
  if (!name || !email || !bio) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  const user = User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  } else {
    user.name = name;
    user.email = email;
    user.bio = bio;
    user.save();
  }
  res.status(200).json({
    message: "User updated successfully",
    data: user,
  });
};

export { getUserProfile, updateUserId };
