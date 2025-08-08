const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");

// 📌 Get all notices
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notices" });
  }
});

// 📌 Add a new notice
router.post("/", async (req, res) => {
  try {
    const { text, isNew } = req.body;
    const newNotice = new Notice({ text, isNew });
    await newNotice.save();
    res.json({ success: true, message: "Notice added", notice: newNotice });
  } catch (err) {
    res.status(500).json({ error: "Failed to add notice" });
  }
});

// 📌 Delete a notice
router.delete("/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notice deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notice" });
  }
});

module.exports = router;
