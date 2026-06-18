const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const backupDir = path.join(__dirname, "temp", "mongodb_dump");

fs.ensureDirSync(backupDir);

// IMPORTANT:
// Replace this with the full path to mongodump.exe on your PC

const mongodumpPath =
  `"C:\\Users\\HP\\Downloads\\mongodb-database-tools-windows-x86_64-100.17.0\\mongodb-database-tools-windows-x86_64-100.17.0\\bin\\mongodump.exe"`;

// database name
const dbName = "test";

const command = `${mongodumpPath} --uri="${process.env.MONGO_URI}" --db=${dbName} --out="${backupDir}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.log(error);
    return;
  }

  if (stderr) {
    console.log(stderr);
  }

  console.log("✅ BSON Backup Created Successfully");

  console.log(backupDir);
});
