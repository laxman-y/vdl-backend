const express = require("express");
const router = express.Router();

// Example: Allowed library network IP range (update this as per your Wi-Fi)
const LIBRARY_IP_PREFIXES = ["192.168.1.", "192.168.0."]; // add multiple prefixes if needed

// GET /api/library/check-wifi → Verify if request comes from library network
router.get("/check-wifi", (req, res) => {
  try {
    // Get client IP
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    console.log("Incoming request IP:", ip);

    // Check if IP starts with any allowed prefix
    const isInLibrary = LIBRARY_IP_PREFIXES.some(prefix => ip.includes(prefix));

    if (isInLibrary) {
      return res.json({
        ok: true,
        message: "✅ Connected to library Wi-Fi. Attendance allowed.",
      });
    } else {
      return res.status(403).json({
        ok: false,
        message: "❌ Not connected to library Wi-Fi. Attendance denied.",
      });
    }
  } catch (err) {
    console.error("Library Wi-Fi check error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

module.exports = router;
