const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
require("dotenv").config();

const backupDir = path.join(__dirname, "temp", "mongodb_dump");

fs.ensureDirSync(backupDir);

const dbName = "test";

// Detect OS
const isWindows = process.platform === "win32";

const mongodumpPath = isWindows
  ? `"C:\\Users\\HP\\Downloads\\mongodb-database-tools-windows-x86_64-100.17.0\\mongodb-database-tools-windows-x86_64-100.17.0\\bin\\mongodump.exe"`
  : "mongodump";

const command =
  `${mongodumpPath} --uri="${process.env.MONGO_URI}" ` +
  `--db=${dbName} --out="${backupDir}"`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.log("❌ BSON Backup Failed");
    console.log(error.message);
    return;
  }

  if (stderr) {
    console.log(stderr);
  }

  console.log("✅ BSON Backup Created Successfully");
  console.log(backupDir);
});
