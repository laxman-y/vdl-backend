const fs = require("fs");
const path = require("path");

const zipFolder = path.join(__dirname, "zip");

const files = fs
  .readdirSync(zipFolder)
  .filter(f => f.endsWith(".zip"))
  .map(f => ({
    name: f,
    time: fs.statSync(path.join(zipFolder, f)).mtime.getTime(),
  }))
  .sort((a, b) => b.time - a.time);

if (files.length > 15) {
  const remove = files.slice(15);

  remove.forEach(file => {
    fs.unlinkSync(path.join(zipFolder, file.name));
    console.log("Deleted:", file.name);
  });
} else {
  console.log("No old backups to delete.");
}
