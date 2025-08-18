import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
const generateAccessToken = (user) => {
  jwt.sign(
    { email: user.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" },
    (err, token) => {
      if (err) throw err;
      return token;
    }
  );
};
const generateRefreshToken = (user) => {
  jwt.sign(
    { email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" },
    (err, token) => {
      if (err) throw err;
      return token;
    }
  );
};
const signup = (req, res) => {
  try {
    const { email, user, password } = req.body;
    if (!email || !user || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newUser = User.findOne({ email });
    if (newUser) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      newUser.create({
        email,
        user,
        password,
      });
      // ✅ Generate tokens
      const accessToken = generateAccessToken(newUser);
      const refreshToken = generateRefreshToken(newUser);

      // ✅ Set refresh token in cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
      });

      return res.status(201).json({
        message: "User registered successfully",
        accessToken,
        refreshToken,
        data: newUser,
      });
    }
  } catch (error) {
    console.log("❌ Error in registerUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const signin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  } else {
    const user = User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
    });

    return res.status(200).json({
      message: "User signed in successfully",
      accessToken,
      refreshToken,
      data: user,
    });
  }
};
const getUserProfile = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log("❌ Error from user profile route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logoutUser = async (req, res) => {
  // * Refresh token cookie clear karo
  res.clearCookie("refreshToken");
  console.log("🚪 User logged out");
  return res.status(200).json({ message: "User logged out successfully" });
};

const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  console.log("♻️ Refresh token received:", token ? "Yes" : "No");

  if (!token)
    return res.status(401).json({ message: "No refresh token found!" });

  try {
    // * Token verify karo
    const decodedToken = jwt.verify(token, process.env.REFRESH_JWT_SECRET);
    console.log("🔓 Token verified:", decodedToken);

    // * Email se user dhoondo
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      console.log("❌ Invalid refresh token (no user found)");
      return res.status(404).json({ message: "Invalid token" });
    }

    // * New access token generate karo
    const newAccessToken = generateAccessToken(user);
    console.log("✅ New access token generated");

    res.json({
      message: "Access token generated",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log("❌ Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

export { signup, signin, getUserProfile, logoutUser, refreshToken };
