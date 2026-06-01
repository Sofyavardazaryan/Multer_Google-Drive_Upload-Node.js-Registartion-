const express = require("express");
const router = express.Router();
const multer = require("multer");
const userModel = require("../model/userModel");
const uploadToDrive = require("../uploadToDrive");
const { oauth2Client, authUrl } = require("../services/googleAuth");

const upload = multer({ dest: "uploads/" });

router.get("/", async (req, res) => {
  const users = await userModel.find();
  res.render("index", {
    users,
    loggedIn: !!req.session.tokens,
  });
});

router.post("/register", async (req, res) => {
  await userModel.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  res.redirect("/");
});

router.get("/auth/google", (req, res) => {
  res.redirect(authUrl);
});

router.get("/auth/google/callback", async (req, res) => {
  const { tokens } = await oauth2Client.getToken(req.query.code);
  oauth2Client.setCredentials(tokens);

  req.session.tokens = tokens;

  res.redirect("/");
});

router.post("/upload", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.session.tokens) {
      return res.redirect("/auth/google");
    }

    const url = await uploadToDrive(req.file, req.session.tokens);

    res.send(`
      <h2>Uploaded ✔</h2>
      <a href="${url}" target="_blank">Open File</a>
    `);
  } catch (err) {
    console.log(err);
    res.status(500).send("Upload error");
  }
});

module.exports = router;
