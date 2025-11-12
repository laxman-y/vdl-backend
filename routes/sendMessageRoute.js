const express = require("express");
const https = require("https");
require("dotenv").config();

const router = express.Router();

// ✅ POST /api/send-message
router.post("/send-message", async (req, res) => {
  const { mobile, message } = req.body;

  if (!mobile || !message) {
    return res
      .status(400)
      .json({ message: "Mobile number and message are required." });
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
      authorization: Soxop9s3SeiRaGn4TIZDlVhJ6YqeiURjn0Md3DcM1B7NF81YwbUS1oCUneJn,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData),
    },
  };

  const request = https.request(options, (response) => {
    let data = "";
    response.on("data", (chunk) => (data += chunk));
    response.on("end", () => {
      try {
        const result = JSON.parse(data);
        if (result.return === true) {
          console.log(`✅ Message sent successfully to ${mobile}`);
          res.json({ message: "✅ Message sent successfully!" });
        } else {
          console.error("❌ Fast2SMS API Error:", result);
          res.status(500).json({ message: "Failed to send message." });
        }
      } catch (err) {
        console.error("Parse error:", err.message);
        res.status(500).json({ message: "Unexpected Fast2SMS response." });
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
