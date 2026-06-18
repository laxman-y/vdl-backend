const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

async function uploadBackup() {
  const zipFolder = path.join(__dirname, "zip");

  const files = fs.readdirSync(zipFolder);

  if (!files.length) {
    console.log("No backup found.");
    return;
  }

  const latest = files.sort().reverse()[0];

  const filePath = path.join(zipFolder, latest);

  console.log("Uploading :", latest);

  console.log("Folder ID:", process.env.GOOGLE_DRIVE_FOLDER_ID);

  const response = await drive.files.create({
    requestBody: {
      name: latest,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: "application/zip",
      body: fs.createReadStream(filePath),
    },
  });

  console.log("=================================");
  console.log("✅ Upload Successful");
  console.log("File ID:", response.data.id);
  console.log("=================================");
}

uploadBackup().catch(console.error);
