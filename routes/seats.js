const express = require("express");
const router = express.Router();
const Student = require("../models/Student");

// ✅ GET /api/seats-status
router.get("/seats-status", async (req, res) => {
  try {
    const students = await Student.find();
    const totalSeats = Array.from({ length: 55 }, (_, i) => (i + 1).toString()); // 1 to 55 as string

    const seatData = totalSeats.map((seatNoStr) => {
      // Find the student whose motherName matches this seat number string
      const student = students.find((s) => s.motherName === seatNoStr);

      const shift1 =
        student && student.shiftNo.includes(1) && student.status !== "disabled"
          ? "full"
          : "empty";
      const shift2 =
        student && student.shiftNo.includes(2) && student.status !== "disabled"
          ? "full"
          : "empty";
      const shift3 =
        student && student.shiftNo.includes(3) && student.status !== "disabled"
          ? "full"
          : "empty";

      return {
        seatNo: seatNoStr, // frontend will show this as seat number
        shift1,
        shift2,
        shift3,
      };
    });

    res.json(seatData);
  } catch (err) {
    console.error("Error fetching seat status:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
