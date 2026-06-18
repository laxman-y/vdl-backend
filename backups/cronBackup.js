const cron = require("node-cron");

cron.schedule("0 2 * * *", () => {
  console.log("Running Daily Backup...");
  require("./backupAll");
});

console.log("Daily Backup Scheduler Started");
