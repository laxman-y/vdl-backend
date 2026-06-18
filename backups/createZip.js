const AdmZip = require("adm-zip");
const path = require("path");
const fs = require("fs-extra");

const tempFolder = path.join(__dirname, "temp");
const zipFolder = path.join(__dirname, "zip");

fs.ensureDirSync(zipFolder);

const now = new Date();

const zipName =
  `Backup_${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}_${String(
    now.getHours()
  ).padStart(2, "0")}-${String(
    now.getMinutes()
  ).padStart(2, "0")}.zip`;

const zip = new AdmZip();

zip.addLocalFolder(tempFolder);

const outputPath = path.join(zipFolder, zipName);

zip.writeZip(outputPath);

console.log("✅ ZIP Created Successfully");
console.log(outputPath);
