// 📁 routes/seats.js
import express from "express";
import Student from "../models/Student.js";

const router = express.Router();

router.get("/seats-status", async (req, res) => {
  try {
    // Total seats: 1 to 52
    const totalSeats = Array.from({ length: 52 }, (_, i) => i + 1);
    const seats = [];

    for (let seat of totalSeats) {
      const seatData = { seatNo: seat, shift1: "empty", shift2: "empty", shift3: "empty" };

      // Find all active students with this seat number
      const students = await Student.find({ seatNo: seat, status: "enabled" });

      students.forEach((student) => {
        if (student.shift.includes("1")) seatData.shift1 = "full";
        if (student.shift.includes("2")) seatData.shift2 = "full";
        if (student.shift.includes("3")) seatData.shift3 = "full";
      });

      seats.push(seatData);
    }

    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching seat data" });
  }
});

export default router;
