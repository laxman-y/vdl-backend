const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const Student = require("../models/Student");

// ==========================
// ADD EXPENSE
// ==========================
router.post("/add", async (req, res) => {
  try {
    const { category, amount, date } = req.body;

    const newExpense = new Account({
      category,
      amount,
      date
    });

    await newExpense.save();
    res.json({ message: "Expense added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// GET ALL EXPENSES
// ==========================
router.get("/all", async (req, res) => {
  const expenses = await Account.find().sort({ date: -1 });
  res.json(expenses);
});

// ==========================
// MONTHLY SUMMARY
// ==========================
router.get("/monthly-summary", async (req, res) => {
  try {

    // Total Income from Students (fees)
    const students = await Student.find();
    let incomeData = {};

    students.forEach(s => {
      s.fees?.forEach(f => {
        const d = new Date(f.date);
        const key = `${d.getFullYear()}-${d.getMonth()+1}`;

        incomeData[key] = (incomeData[key] || 0) + f.amount;
      });
    });

    // Expense data
    const expenses = await Account.find();
    let expenseData = {};

    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()+1}`;

      expenseData[key] = (expenseData[key] || 0) + e.amount;
    });

    // Merge both
    let summary = [];

    const allKeys = new Set([
      ...Object.keys(incomeData),
      ...Object.keys(expenseData)
    ]);

    allKeys.forEach(key => {
      const [year, month] = key.split("-");

      const income = incomeData[key] || 0;
      const expense = expenseData[key] || 0;

      summary.push({
        year: Number(year),
        month: Number(month),
        income,
        expense,
        profit: income - expense
      });
    });

    res.json(summary.sort((a,b)=> b.year - a.year || b.month - a.month));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
