const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  sessions: [
    {
      entryTime: String, // "06:03 AM"
      exitTime: String,  // "11:09 AM"
    }
  ],
  present: Boolean // optional (still useful for summary)
});

const feeSchema = new mongoose.Schema({
  month: String,        // "2025-07"
  status: String,       // "paid" or "unpaid"
  amount: Number,       // 💰 Fee amount (e.g., 500)
  paidOn: Date          // auto-filled when paid
});


// New schema to track modifications
const modificationSchema = new mongoose.Schema({
  field: String,         // e.g., "shiftNo", "name", "fatherName"
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  modifiedAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
  shiftNo: [Number],
  serialNo: Number,
  name: String,
  fatherName: String,
  motherName: String,
  address: String,
  mobile: String,
  admissionDate: Date,
  password: String,
  attendance: [attendanceSchema],
 status: {
    type: String,
    enum: ["enabled", "disabled"],
    default: "enabled"
  },
  // ✅ New date-only fields for enable/disable actions
  enabledDate: { type: Date },
  disabledDate: { type: Date },
  isActive: { type: Boolean, default: true },
  fees: [feeSchema],

    // ⭐ NEW
  expenses: [
    {
      category: String,
      amount: Number,
      date: { type: Date, default: Date.now }
    }
  ],
  
  modificationHistory: [modificationSchema] // 🔧 New field added here
});

module.exports = mongoose.model("Student", studentSchema);
