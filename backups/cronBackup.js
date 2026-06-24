const cron = require("node-cron");

let isRunning = false;

cron.schedule("0 2 * * *", () => {

  if (isRunning) {
    console.log("Backup already running...");
    return;
  }

  isRunning = true;

  console.log("=================================");
  console.log("Running Daily Backup...");
  console.log("=================================");

  try {
    delete require.cache[require.resolve("./backupAll")];
    require("./backupAll");
  } catch (err) {
    console.error(err);
  } finally {
    isRunning = false;
  }

});

console.log("✅ Daily Backup Scheduler Started");
