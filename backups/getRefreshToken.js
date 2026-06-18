const { google } = require("googleapis");
// const open = require("open");
const fs = require("fs");

const keys = require("./oauth2.json");

const oauth2Client = new google.auth.OAuth2(
  keys.installed.client_id,
  keys.installed.client_secret,
  keys.installed.redirect_uris[0]
);

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
];

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\nOpen this URL in browser:\n");
console.log(url);

// open(url);

process.stdin.on("data", async (data) => {

  const code = data.toString().trim();

  const { tokens } = await oauth2Client.getToken(code);

  console.log("\n===============================");
  console.log("REFRESH TOKEN");
  console.log("===============================");
  console.log(tokens.refresh_token);
  console.log("===============================");

  fs.writeFileSync(
    "./backups/token.json",
    JSON.stringify(tokens, null, 2)
  );

  console.log("\nSaved to token.json");

  process.exit();
});
