const fs = require("fs");
const drive = require("../config/drive");
const userModel = require("../model/userModel");

const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user?.id;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const fileMetadata = {
      name: file.originalname,
      ...(user.driveFolderId && { parents: [user.driveFolderId] }),
    };

    const media = {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id, webViewLink",
    });

    const fileId = response.data.id;
    const webViewLink = response.data.webViewLink;

    await drive.permissions.create({
      fileId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    fs.unlink(file.path, (err) => {
      if (err) console.error(err.message);
    });

    return res.json({
      message: "File uploaded successfully",
      fileId,
      url: webViewLink,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err.response?.data || err.message);
    return res.status(500).json({ message: "Upload failed" });
  }
};

module.exports = {
  uploadFile,
};
