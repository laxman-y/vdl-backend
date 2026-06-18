const { execSync } = require("child_process");

try {

  console.log("Step 1/6 Export JSON...");
  execSync("node backups/exportJson.js", { stdio: "inherit" });

  console.log("Step 2/6 Export BSON...");
  execSync("node backups/exportBson.js", { stdio: "inherit" });

  console.log("Step 3/6 Create ZIP...");
  execSync("node backups/createZip.js", { stdio: "inherit" });

  console.log("Step 4/6 Upload Drive...");
  execSync("node backups/uploadBackup.js", { stdio: "inherit" });

  console.log("Step 5/6 Cleanup Local...");
  execSync("node backups/cleanupLocal.js", { stdio: "inherit" });

  console.log("Step 6/6 Cleanup Drive...");
  execSync("node backups/cleanupDrive.js", { stdio: "inherit" });

  console.log("🎉 Daily Backup Completed Successfully");

} catch (err) {
  console.error("Backup Failed:", err);
}
