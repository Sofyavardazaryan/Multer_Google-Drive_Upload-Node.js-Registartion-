const fs = require("fs");
const drive = require("../config/drive");

async function createUserFolder(userName) {
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error("Missing root Google Drive folder ID");
  }

  const res = await drive.files.create({
    requestBody: {
      name: userName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    },
    fields: "id",
  });

  return res.data.id;
}

async function uploadToDrive(file, folderId) {
  if (!file) throw new Error("No file provided");

  const res = await drive.files.create({
    requestBody: {
      name: file.filename,
      ...(folderId && { parents: [folderId] }),
    },
    media: {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    },
    fields: "id",
  });

  const fileId = res.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  fs.unlink(file.path, (err) => {
    if (err) console.error("File delete error:", err.message);
  });

  return `https://drive.google.com/file/d/${fileId}/view`;
}

module.exports = { createUserFolder, uploadToDrive };
