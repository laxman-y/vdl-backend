const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { updateStudent } = require("../controllers/studentController");
const PDFDocument = require('pdfkit');
const path = require("path");
const fs = require("fs");
import haversine from "haversine-distance"; // install: npm i haversine-distance






// ==================================
// ✅ Attendance Routes (with GPS verification)
// ==================================

const LIBRARY_LAT = 25.963590; // Replace with your library latitude
const LIBRARY_LON = 83.367599; // Replace with your library longitude
const MAX_DISTANCE_METERS = 150; // Allowed distance in meters

// Helper: Haversine formula
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ✅ POST /api/students/attendance/:id → Mark attendance
router.post("/attendance/:id", async (req, res) => {
  const { date, present, password, lat, lon } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    // ✅ Step 1: Password (mobile) validation
    if (!password || password !== student.mobile) {
      return res.status(401).json({ error: "Invalid password (mobile number)" });
    }

    // ✅ Step 2: GPS validation
    if (lat && lon) {
      const distance = getDistanceFromLatLonInMeters(
        lat,
        lon,
        LIBRARY_LAT,
        LIBRARY_LON
      );
      if (distance > MAX_DISTANCE_METERS) {
        return res.status(403).json({
          error: `You are too far from the library (${Math.round(distance)}m). Attendance denied.`,
        });
      }
    } else {
      return res.status(400).json({ error: "Location data missing." });
    }

    // ✅ Step 3: Attendance update logic
    const existing = student.attendance.find((a) => a.date === date);
    if (existing) {
      existing.present = present;
    } else {
      student.attendance.push({ date, present });
    }

    await student.save();
    res.json({ message: "Attendance updated successfully with location" });
  } catch (err) {
    console.error("Attendance error:", err);
    res.status(500).json({ error: "Attendance update failed" });
  }
});

// ✅ POST /api/students/attendance/:id/entry → Mark entry time
router.post("/attendance/:id/entry", async (req, res) => {
  const { date, entryTime } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    let record = student.attendance.find((a) => a.date === date);

    if (!record) {
      record = { date, sessions: [{ entryTime }] };
      student.attendance.push(record);
    } else {
      record.sessions.push({ entryTime });
    }

    await student.save();
    res.json({ message: "Entry marked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark entry" });
  }
});

// ✅ POST /api/students/attendance/:id/exit → Mark exit time
router.post("/attendance/:id/exit", async (req, res) => {
  const { date, exitTime } = req.body;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const record = student.attendance.find((a) => a.date === date);
    if (!record || record.sessions.length === 0) {
      return res.status(400).json({ error: "No entry session to mark exit" });
    }

    const lastSession = record.sessions[record.sessions.length - 1];
    if (lastSession.exitTime) {
      return res.status(400).json({ error: "Last session already has exit" });
    }

    lastSession.exitTime = exitTime;
    await student.save();
    res.json({ message: "Exit marked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark exit" });
  }
});



router.get("/attendance-summary", async (req, res) => {
    const { month, password } = req.query;

    if (!month || !password) {
        return res.status(400).json({ error: "Month and password are required." });
    }

    try {
        const student = await Student.findOne({ mobile: password });

        if (!student) {
            return res.status(404).json({ error: "Student not found." });
        }

        const [year, monthNumber] = month.split("-");
        const attendanceDetails = (student.attendance || []).filter((record) => {
            const [recYear, recMonth] = record.date.split("-");
            return recYear === year && recMonth === monthNumber;
        });

        const presentCount = attendanceDetails.length;
        const totalDays = new Date(year, monthNumber, 0).getDate();
        const absentCount = totalDays - presentCount;

        const summary = [{
            _id: student._id,
            serialNo: student.serialNo,
            name: student.name,
            shiftNo: student.shiftNo,
            presentCount,
            absentCount,
            attendanceDetails,
        }];

        res.json(summary);
    } catch (error) {
        console.error("Error fetching summary:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});


// GET /api/students/attendance-summary?month=YYYY-MM → Summary
router.get("/attendance-summary", async (req, res) => {
  const { month } = req.query;

  try {
    const students = await Student.find();

    const summary = students.map((student) => {
      const attendanceThisMonth = (student.attendance || []).filter((a) =>
        a.date && a.date.startsWith(month)
      );

      const presentCount = attendanceThisMonth.filter((a) => a.present).length;
      const absentCount = attendanceThisMonth.filter((a) => a.present === false).length;

      const attendanceDetails = attendanceThisMonth.map((record) => ({
        date: record.date,
        sessions: Array.isArray(record.sessions)
          ? record.sessions
          : [{ entryTime: record.entryTime, exitTime: record.exitTime }]
      }));

      return {
        _id: student._id,
        name: student.name,
        serialNo: student.serialNo,
        shiftNo: student.shiftNo,
        presentCount,
        absentCount,
        attendanceDetails
      };
    });

    res.json(summary);
  } catch (err) {
    console.error("❌ Summary fetch error:", err);
    res.status(500).json({ error: "Failed to fetch attendance summary" });
  }
});

// Admin-only route to fetch all attendance summaries
router.get("/attendance-summary-no-password", async (req, res) => {
    const { month } = req.query;

    if (!month) return res.status(400).json({ error: "Month is required." });

    try {
        const [year, monthNumber] = month.split("-");
        const students = await Student.find({});

        const summary = students.map((student) => {
            const attendanceDetails = (student.attendance || []).filter((record) => {
                const [recYear, recMonth] = record.date.split("-");
                return recYear === year && recMonth === monthNumber;
            });

            console.log(student.name, attendanceDetails.map(a => a.date)); // debug

            const presentCount = attendanceDetails.filter(a => a.present).length;
            const totalDays = new Date(year, parseInt(monthNumber), 0).getDate();
            const absentCount = totalDays - presentCount;

            return {
                _id: student._id,
                serialNo: student.serialNo,
                name: student.name,
                shiftNo: student.shiftNo,
                presentCount,
                absentCount,
                attendanceDetails,
            };
        });

        res.json(summary);
    } catch (error) {
        console.error("Error fetching summary (no password):", error);
        res.status(500).json({ error: "Internal server error." });
    }
});




// ✅ Toggle Student Active/Inactive
// router.put("/toggle-status/:id", async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student) return res.status(404).json({ message: "Student not found" });
//     student.isActive = !student.isActive;
//     await student.save();
//     res.json({ message: "Student status updated", student });
//   } catch (err) {
//     console.error("Error toggling status:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// ✅ Enable/Disable student
// router.patch("/students/:id/status", async (req, res) => {
//   const { status } = req.body; // expected: "enabled" or "disabled"
//   try {
//     const student = await Student.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     if (!student) return res.status(404).json({ message: "Student not found" });
//     res.json(student);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update student status" });
//   }
// });


// ==================================
// ✅ Fee Update
// ==================================
router.post("/fees/:id", async (req, res) => {
  try {
    const { month, status, amount, paidOn } = req.body;
    console.log("📩 Fee update request:", req.params.id, { month, status, amount, paidOn });

    const student = await Student.findById(req.params.id);
    if (!student) {
      console.log("❌ Student not found:", req.params.id);
      return res.status(404).json({ error: "Student not found" });
    }

    let feeRecord = student.fees.find((f) => f.month === month);

    if (feeRecord) {
      console.log("🔄 Updating existing fee record...");
      feeRecord.status = status;
      feeRecord.amount = amount;
      if (status === "paid") {
        feeRecord.paidOn = paidOn ? new Date(paidOn) : new Date();
      } else {
        feeRecord.paidOn = null;
      }
    } else {
      console.log("➕ Adding new fee record...");
      student.fees.push({
        month,
        status,
        amount,
        paidOn: status === "paid" ? (paidOn ? new Date(paidOn) : new Date()) : null,
      });
    }

    await student.save();
    console.log("✅ Fee updated successfully!");
    res.json({ message: "Fee updated successfully", student });
  } catch (err) {
    console.error("🔥 Fee update error:", err.message, err.stack);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

router.post("/verify-student-mobile", async (req, res) => {
  try {
    const { mobile } = req.body;
    const student = await Student.findOne({ mobile });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // No hashing — directly match mobile number
    res.json(student);
  } catch (err) {
    console.error("Error verifying student:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route: POST /api/students/download-receipt

router.post("/download-receipt", async (req, res) => {
  try {
    const { month, password } = req.body;
   
    if (!month || !password) {
      return res.status(400).json({ error: "Month and password are required" });
    }

    // 1. Find student by mobile
    const student = await Student.findOne({ mobile: password.trim() });
    if (!student) {
      return res.status(404).json({ error: "Invalid mobile number" });
    }

    // 2. Find paid fee record for month
    const feeRecord = student.fees.find(
      (f) => f.month === month && f.status === "paid"
    );
    if (!feeRecord) {
      return res.status(400).json({ error: "Fee not paid for this month" });
    }

    // === PDF setup ===
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt_${student.name}_${month}.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    // === Page Border ===
doc.lineWidth(2)
  .strokeColor("#2E8B57") // Green border
  .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
  .stroke();

// Optional Inner Border for design
doc.lineWidth(1)
  .strokeColor("#ccc")
  .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
  .stroke();


    // === Watermark ===
    doc.fontSize(40)
      .fillColor("lightblue")
      .opacity(0.9)
      .text("Vinayak Digital Library Karhan Mau U.P (276402)", 50, 300, { align: "center", angle: 90 })
      .opacity(1);

    // === Header with Logo ===
    const logoPath = path.join(__dirname, "../public/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 40, { width: 80 });
    }
    doc.fontSize(20).fillColor("#2E8B57").text("Vinayak Digital Library", 150, 45);
    doc.fontSize(12).fillColor("#555").text("Karhan, Mau, Uttar Pradesh (276402) ", 150, 65);
    doc.text("Phone: +91-9415883700, Phone: +91-9450881837, Email: shashi.mau62@gmail.com", 150, 80);
    doc.moveDown(3);

    // === Title ===
    doc.fontSize(16).fillColor("#000").text("Fee Receipt", 45, 200, { align: "center", underline: true });
    doc.moveDown(3);

    // === Table Function ===
    const drawRow = (y, col1, col2) => {
      doc.rect(50, y, 250, 20).stroke();
      doc.rect(300, y, 250, 20).stroke();
      doc.text(col1, 55, y + 5);
      doc.text(col2, 305, y + 5);
    };

    // === Student Details Table ===
    let y = doc.y + 10;
    drawRow(y, `Name: ${student.name}`, `Father: ${student.fatherName}`);
    y += 20;
    drawRow(y, `Shift No: ${student.shiftNo.join(", ")}`, `Serial No: ${student.serialNo}`);
    y += 20;
    drawRow(y, `Mobile: ${student.mobile}`, `Admission: ${new Date(student.admissionDate).toLocaleDateString("en-IN")}`);
    y += 40;

    // === Payment Details Table ===
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const [year, monthNum] = month.split("-");
    const monthName = monthNames[parseInt(monthNum) - 1];
    drawRow(y, `Month Paid: ${monthName} ${year}`, `Amount: ${feeRecord.amount}`);
    y += 20;
    drawRow(y, `Status: Paid`, `Date: ${new Date(feeRecord.paidOn).toLocaleDateString("en-IN")}`);
    y += 60;

    // === Signature ===
    const signPath = path.join(__dirname, "../public/sign.png");
    if (fs.existsSync(signPath)) {
      doc.image(signPath, 400, y - 10, { width: 100 });
    }
    doc.text("Authorized Signature", 350, y + 55);

    doc.end();

  } catch (error) {
    console.error("Receipt generation error:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// ==================================
// ✅ Student CRUD
// ==================================


// ✅ Enable/Disable student
// router.patch("/students/:id/status", async (req, res) => {
//   const { status } = req.body; // expected: "enabled" or "disabled"
//   try {
//     const student = await Student.findByIdAndUpdate(
//       req.params.id,
//       { status },
//       { new: true }
//     );
//     if (!student) return res.status(404).json({ message: "Student not found" });
//     res.json(student);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to update student status" });
//   }
// });


// POST /api/students → Create student
router.post("/", async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student added", student });
  } catch (err) {
    console.error("❌ Failed to add student:", err);
    res.status(500).json({ error: "Failed to add student" });
  }
});

// GET /api/students → Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (err) {
    console.error("❌ Failed to fetch students:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// PUT /api/students/:id → Update (with history tracking)
router.put("/:id", updateStudent);

// DELETE /api/students/:id → Delete
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Student not found" });
    res.json({ message: "Student deleted" });
  } catch (err) {
    console.error("❌ Failed to delete student:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// ✅ Enable / Disable student (NEW)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["enabled", "disabled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.json({ message: "Student status updated", student });
  } catch (err) {
    console.error("Error updating student status:", err);
    res.status(500).json({ error: "Failed to update student status" });
  }
});

// ==================================
// // ✅ Get flattened list of student modifications (audit log)
router.get("/modifications", async (req, res) => {
    try {
        const students = await Student.find({}, "name fatherName motherName mobile modificationHistory");
        const modifications = [];
        students.forEach((student) => {
            if (Array.isArray(student.modificationHistory)) {
                student.modificationHistory.forEach((mod) => {
                    modifications.push({
                        name: student.name,
                        fatherName: student.fatherName,
                        motherName: student.motherName,
                        mobile: student.mobile,
                        field: mod.field,
                        oldValue: mod.oldValue,
                        newValue: mod.newValue,
                        changeType: mod.changeType,
                        modifiedAt: mod.modifiedAt, // ✅ Ensure this is included
                    });
                });
            }
        });

        res.json(modifications);
    } catch (err) {
        console.error("Error fetching modifications:", err);
        res.status(500).json({ error: "Failed to fetch modifications" });
    }
});


// ✅ LAST: Get student by ID — this must come at the very end
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error("❌ Error fetching student by ID:", err);
    res.status(500).json({ error: "Student not found" });
  }
});




// Route: POST /api/students/:id/mark-fee-paid
router.post("/students/:id/mark-fee-paid", async (req, res) => {
  const studentId = req.params.id;
  const { month, amount } = req.body;

  try {
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Check if the month already exists
    const feeRecord = student.fees.find(f => f.month === month);

    if (feeRecord) {
      feeRecord.status = "Paid";
      feeRecord.paidOn = new Date();
      feeRecord.amount = amount; // ✅ set amount
    } else {
      student.fees.push({
        month,
        status: "Paid",
        paidOn: new Date(),
        amount: amount // ✅ set amount
      });
    }

    await student.save();
    res.json({ message: "Fee marked as paid" });
  } catch (error) {
    console.error("Fee update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});





module.exports = router;

