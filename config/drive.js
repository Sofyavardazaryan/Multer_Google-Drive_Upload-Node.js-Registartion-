const { google } = require("googleapis");
const { oauth2Client } = require("../services/googleAuth");

const drive = google.drive({
  version: "v3",
  auth: oauth2Client,
});

module.exports = drive;
