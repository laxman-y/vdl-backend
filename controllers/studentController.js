const Student = require('../models/Student');

const updateStudent = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const fieldsToTrack = [
      "shiftNo", "serialNo", "name", "fatherName",
      "motherName", "address", "mobile", "admissionDate"
    ];

    fieldsToTrack.forEach(field => {
      const oldValue = student[field];
      const newValue = updatedData[field];

      const isDifferent = Array.isArray(oldValue)
        ? JSON.stringify(oldValue) !== JSON.stringify(newValue)
        : oldValue?.toString() !== newValue?.toString();

      if (isDifferent) {
        student.modificationHistory.push({
          field,
          oldValue,
          newValue,
         modifiedAt: new Date()
        });

        student[field] = newValue;
      }
    });

    await student.save();
    res.status(200).json({ message: "Student updated and history recorded." });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { updateStudent };
