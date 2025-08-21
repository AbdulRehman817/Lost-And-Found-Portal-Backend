import { User } from "../models/user.models.js";
import { Resend } from "resend";
import { generateOtp } from "../utils/otp.js";

const resend = new Resend(process.env.RESEND_API_KEY);

// TODO ================== Send OTP ================== //
const sendOtp = async (req, res) => {
  try {
    const user = req.dbUser; // from ensureUser
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Prevent spamming: only allow OTP request every 1 minute
    if (user.otpExpiry && user.otpExpiry > Date.now() - 60 * 1000) {
      return res.status(429).json({
        message: "Please wait a minute before requesting a new OTP",
      });
    }

    const otp = generateOtp(); // usually 6-digit code
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    await resend.emails.send({
      from: "abdulrehman1718@gmail.com",
      to: user.email,
      subject: "Your OTP Code",
      html: `<p>Your OTP code is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// TODO ================== Verify OTP ================== //
const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.dbUser;

    if (!user.otp || !user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired or not generated" });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

export { sendOtp, verifyOtp };
