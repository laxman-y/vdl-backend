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


// ======================================
// MONTHLY INCOME / EXPENSE / PROFIT
// ======================================
router.get("/monthly-summary", async (req, res) => {
  try {

    // =============================
    // 1️⃣ MONTHLY INCOME (FROM STUDENT FEES)
    // =============================
    const incomeData = await Student.aggregate([
      { $unwind: "$fees" },
      {
        $match: {
          "fees.date": { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$fees.date" },
            month: { $month: "$fees.date" }
          },
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
    // 3️⃣ MERGE BOTH RESULTS
    // =============================
    let summaryMap = {};

    // Add income
    incomeData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;

      summaryMap[key] = {
        year: item._id.year,
        month: item._id.month,
        income: item.totalIncome,
        expense: 0
      };
    });

    // Add expense
    expenseData.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;

      if (!summaryMap[key]) {
        summaryMap[key] = {
          year: item._id.year,
          month: item._id.month,
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
      year: item.year,
      month: item.month,
      income: item.income,
      expense: item.expense,
      profit: item.income - item.expense
    }));


    // =============================
    // 5️⃣ SORT (Latest Month First)
    // =============================
    finalData.sort((a, b) =>
      b.year - a.year || b.month - a.month
    );


    res.json(finalData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
