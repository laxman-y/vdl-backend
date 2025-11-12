const express = require("express");
const https = require("https");
require("dotenv").config();

const router = express.Router();

/**
 * @route   POST /send-message
 * @desc    Send a custom SMS via Fast2SMS
 * @access  Private (for admin use)
 */
router.post("/send-message", async (req, res) => {
  const { mobile, message } = req.body;

  if (!mobile || !message) {
    return res
      .status(400)
      .json({ message: "Mobile number and message are required." });
  }

  // ✅ Fast2SMS API payload
  const postData = JSON.stringify({
    route: "v3",
    sender_id: "TXTIND",
    message,
    language: "english",
    flash: 0,
    numbers: mobile,
  });

  // ✅ HTTPS options
  const options = {
    hostname: "www.fast2sms.com",
    path: "/dev/bulkV2",
    method: "POST",
    headers: {
      authorization: process.env.FAST2SMS_API_KEY,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  // ✅ Send request using Node's built-in https module
  const request = https.request(options, (response) => {
    let data = "";
    response.on("data", (chunk) => (data += chunk));
    response.on("end", () => {
      try {
        const result = JSON.parse(data);
        if (result.return === true) {
          console.log(`✅ Message sent to ${mobile}`);
          res.json({ message: "✅ Message sent successfully!" });
        } else {
          console.error("❌ Fast2SMS API Error:", result);
          res.status(500).json({ message: "Failed to send message." });
        }
      } catch (err) {
        console.error("Parsing error:", err.message);
        res.status(500).json({ message: "Unexpected API response." });
      }
    });
  });

  request.on("error", (error) => {
    console.error("HTTPS Error:", error);
    res.status(500).json({ message: "Server error while sending SMS." });
  });

  request.write(postData);
  request.end();
});

module.exports = router;
