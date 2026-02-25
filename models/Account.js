const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Account", accountSchema);
