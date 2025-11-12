import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * @route   POST /send-message
 * @desc    Send a custom SMS to a student via Fast2SMS
 * @access  Private (for admin use)
 */
router.post("/", async (req, res) => {
  const { mobile, message } = req.body;

  // 🧩 Validation
  if (!mobile || !message) {
    return res.status(400).json({ message: "Mobile number and message are required." });
  }

  try {
    // 📨 Fast2SMS API request
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "v3",
        sender_id: "TXTIND", // Standard Fast2SMS sender ID
        message,
        language: "english",
        flash: 0,
        numbers: mobile,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY, // Store key in .env file
        },
      }
    );

    // ✅ On success
    res.json({ message: "✅ Message sent successfully!" });
  } catch (error) {
    console.error("❌ Fast2SMS Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to send message. Please try again." });
  }
});

export default router;
