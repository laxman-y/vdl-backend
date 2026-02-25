const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const Student = require("../models/Student");


// ======================================
// ADD EXPENSE
// ======================================
router.post("/add", async (req, res) => {
  try {
    const { category, amount, date } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newExpense = new Account({
      category,
      amount: Number(amount),
      date: new Date(date)
    });

    await newExpense.save();

    res.json({ message: "Expense added successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ======================================
// GET ALL EXPENSES
// ======================================
router.get("/all", async (req, res) => {
  try {
    const expenses = await Account.find()
      .sort({ date: -1 });

    res.json(expenses);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/monthly-summary", async (req, res) => {
  try {

    // =============================
    // 1️⃣ MONTHLY INCOME (FROM FEES USING month FIELD)
    // =============================
    const incomeData = await Student.aggregate([
      { $unwind: "$fees" },
      {
        $match: {
          "fees.status": "paid"
        }
      },
      {
        $group: {
          _id: "$fees.month",   // "2026-01"
          totalIncome: { $sum: "$fees.amount" }
        }
      }
    ]);


    // =============================
    // 2️⃣ MONTHLY EXPENSE
    // =============================
    const expenseData = await Account.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalExpense: { $sum: "$amount" }
        }
      }
    ]);


   // =============================
// 3️⃣ MERGE DATA (FIXED)
// =============================
let summaryMap = {};

// Helper to pad month
const padMonth = (m) => m.toString().padStart(2, "0");

// Add income
incomeData.forEach(item => {
  if (!item._id) return;

  const [year, month] = item._id.split("-");
  const key = `${year}-${padMonth(month)}`;

  summaryMap[key] = {
    year: Number(year),
    month: Number(month),
    income: item.totalIncome,
    expense: 0
  };
});

// Add expense
expenseData.forEach(item => {
  const year = item._id.year;
  const month = padMonth(item._id.month);

  const key = `${year}-${month}`;

  if (!summaryMap[key]) {
    summaryMap[key] = {
      year: Number(year),
      month: Number(month),
      income: 0,
      expense: item.totalExpense
    };
  } else {
    summaryMap[key].expense = item.totalExpense;
  }
});
    // =============================
    // 4️⃣ CALCULATE PROFIT
    // =============================
    const finalData = Object.values(summaryMap).map(item => ({
      ...item,
      profit: item.income - item.expense
    }));


    // Sort
    finalData.sort((a, b) =>
      b.year - a.year || b.month - a.month
    );

    res.json(finalData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
