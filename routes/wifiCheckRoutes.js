const express = require("express");
const Student = require("../models/Student");
const calculateFeeStatus = require("../utils/feeDueCalculator");

const router = express.Router();

router.get("/:mobile", async (req, res) => {
  try {
    const student = await Student.findOne({
      mobile: req.params.mobile
    });

    if (!student) {
      return res.status(404).json({
        allowed: false,
        reason: "Student not found"
      });
    }

    console.log("Student:", student.name);
console.log("Admission Date:", student.admissionDate);
console.log("Disable Logs:", student.disableLogs);

    const result =
      calculateFeeStatus(student);

    return res.json(result);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      allowed: false,
      reason: "Server error"
    });
  }
});

module.exports = router;
