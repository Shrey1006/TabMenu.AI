import express from "express";
import jwt from "jsonwebtoken";
import OTP from "../models/OTP.js";

const router = express.Router();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RESEND_ATTEMPTS = 3;
const MAX_VERIFY_ATTEMPTS = 3;

// POST /api/otp/send - Send OTP to phone
router.post("/send", async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
  }

  try {
    let otpRecord = await OTP.findOne({ phone });

    // Check if record exists and is not expired
    if (otpRecord && otpRecord.expiresAt > new Date()) {
      if (otpRecord.resendAttempts >= MAX_RESEND_ATTEMPTS) {
        return res.status(429).json({
          message: "Maximum OTP resend limit reached. Please wait 5 minutes before trying again."
        });
      }
      // Increment resend attempts and update OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      otpRecord.otp = newOtp;
      otpRecord.expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
      otpRecord.resendAttempts += 1;
      otpRecord.verificationAttempts = 0; // Reset verification attempts for the new code
      await otpRecord.save();

      console.log(`[OTP] Generated new OTP for ${phone}: ${newOtp}`);

      const response = { message: "Verification code sent successfully" };
      if (process.env.NODE_ENV !== "production") {
        response.mockOtp = newOtp;
      }
      return res.json(response);
    }

    // Delete expired record if exists
    if (otpRecord) {
      await OTP.deleteOne({ phone });
    }

    // Create a new OTP record
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await OTP.create({
      phone,
      otp,
      expiresAt,
      resendAttempts: 0,
      verificationAttempts: 0,
      verified: false
    });

    console.log(`[OTP] Generated OTP for ${phone}: ${otp}`);

    const response = { message: "Verification code sent successfully" };
    if (process.env.NODE_ENV !== "production") {
      response.mockOtp = otp;
    }
    return res.json(response);

  } catch (error) {
    console.error("Error in sending OTP:", error);
    return res.status(500).json({ message: "Server error sending verification code" });
  }
});

// POST /api/otp/verify - Verify OTP code
router.post("/verify", async (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ message: "Phone number and OTP code are required" });
  }

  try {
    const otpRecord = await OTP.findOne({ phone });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (otpRecord.verificationAttempts >= MAX_VERIFY_ATTEMPTS) {
      await OTP.deleteOne({ phone });
      return res.status(400).json({ message: "Too many failed verification attempts. Please request a new OTP." });
    }

    otpRecord.verificationAttempts += 1;
    await otpRecord.save();

    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        message: `Invalid verification code. Attempts remaining: ${MAX_VERIFY_ATTEMPTS - otpRecord.verificationAttempts}`
      });
    }

    // OTP matches! Generate token
    const token = jwt.sign(
      { phone, verified: true },
      process.env.JWT_SECRET || "ambika_super_secret",
      { expiresIn: "10m" }
    );

    // Clean up OTP record from DB
    await OTP.deleteOne({ phone });

    return res.json({
      message: "Mobile number verified successfully",
      otpToken: token
    });

  } catch (error) {
    console.error("Error in verifying OTP:", error);
    return res.status(500).json({ message: "Server error verifying verification code" });
  }
});

export default router;
