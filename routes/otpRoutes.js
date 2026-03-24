const express = require("express");
const router = express.Router();

const otpStore = {};

// generate otp
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/* SEND OTP */

router.post("/send", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone number required",
    });
  }

  const otp = generateOTP();

  otpStore[phone] = otp;

  console.log("OTP for", phone, ":", otp);

  res.json({
    success: true,
    message: "OTP generated (check server console)",
  });
});

/* VERIFY OTP */

router.post("/verify", (req, res) => {
  const { phone, otp } = req.body;

  if (otpStore[phone] === otp) {
    delete otpStore[phone];

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  }

  res.status(400).json({
    success: false,
    message: "Invalid OTP",
  });
});

module.exports = router;