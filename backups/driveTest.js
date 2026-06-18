const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  keyFile: "./backups/credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

async function testDrive() {
  const drive = google.drive({
    version: "v3",
    auth,
  });

  try {
    const res = await drive.files.list({
      pageSize: 10,
      fields: "files(id,name)",
    });

    console.log("✅ Connected Successfully");

    console.log(res.data.files);
  } catch (err) {
    console.log("❌ Connection Failed");

    console.log(err.message);
  }
}

testDrive();
