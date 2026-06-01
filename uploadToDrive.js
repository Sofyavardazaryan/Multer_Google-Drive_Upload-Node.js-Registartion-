const { google } = require("googleapis");
const fs = require("fs");
const oauth2Client = new google.auth.OAuth2();

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

async function uploadToDrive(file, tokens) {
  if (!tokens || !tokens.access_token) {
    throw new Error("Missing Google OAuth token");
  }
  oauth2Client.setCredentials(tokens);

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
    },
    media: {
      body: fs.createReadStream(file.path),
    },
  });

  const fileId = response.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return `https://drive.google.com/file/d/${fileId}/view`;
}

module.exports = uploadToDrive;
