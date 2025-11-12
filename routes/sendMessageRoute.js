const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

/**
 * @route   POST /send-message
 * @desc    Send a custom SMS to a student via Fast2SMS
 * @access  Private (for admin use)
 */
router.post("/", async (req, res) => {
  const { mobile, message } = req.body;

  // 🧩 Validate input
  if (!mobile || !message) {
    return res
      .status(400)
      .json({ message: "Mobile number and message are required." });
  }

  try {
    // 📨 Fast2SMS API call
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "v3",
        sender_id: "TXTIND",
        message,
        language: "english",
        flash: 0,
        numbers: mobile, // you can pass comma-separated numbers here
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
        },
      }
    );

    // ✅ On success
    res.json({ message: "✅ Message sent successfully!" });
  } catch (error) {
    console.error("❌ Fast2SMS Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ message: "Failed to send message. Please try again." });
  }
});

module.exports = router;
