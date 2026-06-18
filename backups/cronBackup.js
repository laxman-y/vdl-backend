const cron = require("node-cron");

cron.schedule("* * * * *", () => {
  console.log("=================================");
  console.log("Running Daily Backup...");
  console.log("=================================");

  delete require.cache[require.resolve("./backupAll")];
  require("./backupAll");
});

console.log("✅ Daily Backup Scheduler Started");
