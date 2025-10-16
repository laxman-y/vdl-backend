const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// ✅ GET /api/seats-status
router.get("/seats-status", async (req, res) => {
  try {
    const students = await Student.find();
    const totalSeats = Array.from({ length: 52 }, (_, i) => i + 1);

    const seatData = totalSeats.map((seat) => {
      const seatStudents = students.filter((s) => s.seatNo === seat);

      const shift1 = seatStudents.some(
        (s) => s.shift === 1 && s.status !== "disabled"
      )
        ? "full"
        : "empty";
      const shift2 = seatStudents.some(
        (s) => s.shift === 2 && s.status !== "disabled"
      )
        ? "full"
        : "empty";
      const shift3 = seatStudents.some(
        (s) => s.shift === 3 && s.status !== "disabled"
      )
        ? "full"
        : "empty";

      return { seatNo: seat, shift1, shift2, shift3 };
    });

    res.json(seatData);
  } catch (err) {
    console.error("Error fetching seat status:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
