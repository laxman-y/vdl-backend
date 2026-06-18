cron.schedule("0 2 * * *", () => {
    console.log("Running Daily Backup...");
    delete require.cache[require.resolve("./backupAll")];
    require("./backupAll");
});
