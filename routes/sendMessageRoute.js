const express = require("express");
const https = require("https");
require("dotenv").config();

const router = express.Router();

// ✅ FIXED: make route path "/"
router.post("/", async (req, res) => {
  const { mobile, message } = req.body;

  if (!mobile || !message) {
    return res.status(400).json({ message: "Mobile number and message are required." });
  }

  const postData = JSON.stringify({
    route: "v3",
    sender_id: "TXTIND",
    message,
    language: "english",
    flash: 0,
    numbers: mobile,
  });

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

  const request = https.request(options, (response) => {
    let data = "";
    response.on("data", (chunk) => (data += chunk));
    response.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.return === true) {
          console.log(`✅ Message sent to ${mobile}`);
          res.json({ message: "✅ Message sent successfully!" });
        } else {
          console.error("❌ Fast2SMS Error:", parsed);
          res.status(500).json({ message: "Failed to send message." });
        }
      } catch (err) {
        console.error("Parsing error:", err.message);
        res.status(500).json({ message: "Unexpected response from Fast2SMS." });
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
