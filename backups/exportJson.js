const mongoose = require("mongoose");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const Student = require("../models/Student");
const User = require("../models/User");
const Account = require("../models/Account");
const Notice = require("../models/Notice");

async function exportJSON() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    const backupDir = path.join(__dirname, "temp");

    await fs.emptyDir(backupDir);

    const students = await Student.find().lean();

    const users = await User.find().lean();

    const accounts = await Account.find().lean();

    const notices = await Notice.find().lean();

    await fs.writeJson(
      path.join(backupDir, "students.json"),
      students,
      { spaces: 2 }
    );

    await fs.writeJson(
      path.join(backupDir, "users.json"),
      users,
      { spaces: 2 }
    );

    await fs.writeJson(
      path.join(backupDir, "accounts.json"),
      accounts,
      { spaces: 2 }
    );

    await fs.writeJson(
      path.join(backupDir, "notices.json"),
      notices,
      { spaces: 2 }
    );

    console.log("✅ JSON Backup Created Successfully");

    console.log("----------------------------");

    console.log("Students :", students.length);

    console.log("Users :", users.length);

    console.log("Accounts :", accounts.length);

    console.log("Notices :", notices.length);

    console.log("----------------------------");

    process.exit();

  } catch (err) {

    console.log(err);

  }
}

exportJSON();
