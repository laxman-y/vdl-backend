const express = require("express");
const Student = require("../models/Student");
const calculateFeeStatus = require("../utils/feeDueCalculator");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const students = await Student.find();

    const approvedMobiles = [];

    for (const student of students) {

      const feeStatus =
        calculateFeeStatus(student);

      if (feeStatus.allowed) {
        approvedMobiles.push(student.mobile);
      }
    }

    res.json({
      success: true,
      mobiles: approvedMobiles
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });
  }
});

module.exports = router;
