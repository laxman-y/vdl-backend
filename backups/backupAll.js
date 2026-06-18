const { execSync } = require("child_process");

try {
  console.log("Step 1/4 Export JSON...");
  execSync("node backups/exportJson.js", { stdio: "inherit" });

  console.log("Step 2/4 Export BSON...");
  execSync("node backups/exportBson.js", { stdio: "inherit" });

  console.log("Step 3/4 Create ZIP...");
  execSync("node backups/createZip.js", { stdio: "inherit" });

  console.log("Step 4/4 Upload Drive...");
  execSync("node backups/uploadBackup.js", { stdio: "inherit" });

  console.log("Step 5/5 Cleanup Local...");
execSync("node backups/cleanupLocal.js", {
  stdio: "inherit",
});

console.log("Step 5/6 Cleanup Local...");
require("./cleanupLocal");

console.log("Step 6/6 Cleanup Drive...");
require("./cleanupDrive");

console.log("\n🎉 Daily Backup Completed Successfully");
} catch (err) {
  console.error("Backup Failed:", err);
}
