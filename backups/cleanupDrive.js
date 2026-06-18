
const { google } = require("googleapis");
const path = require("path");

console.log("Current Directory:", process.cwd());
console.log("__dirname:", __dirname);

// Load .env
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

console.log("CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "Loaded" : "Missing");
console.log("CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "Loaded" : "Missing");
console.log("REFRESH_TOKEN:", process.env.GOOGLE_REFRESH_TOKEN ? "Loaded" : "Missing");
console.log("FOLDER_ID:", process.env.GOOGLE_DRIVE_FOLDER_ID ? "Loaded" : "Missing");

// OAuth2
const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost"
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// Google Drive
const drive = google.drive({
  version: "v3",
  auth,
});

async function cleanup() {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields: "files(id,name,createdTime)",
    orderBy: "createdTime desc",
  });

  const files = res.data.files || [];

  console.log("Total backups:", files.length);

  if (files.length <= 15) {
    console.log("No old backups to delete.");
    return;
  }

  const oldFiles = files.slice(15);

  for (const file of oldFiles) {
    await drive.files.delete({
      fileId: file.id,
    });

    console.log("Deleted:", file.name);
  }

  console.log("Drive cleanup completed.");
}

cleanup().catch(console.error);

