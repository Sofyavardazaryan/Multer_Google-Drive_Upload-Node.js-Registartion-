const express = require("express");
const router = express.Router();
const { oauth2Client, getAuthUrl } = require("../services/googleAuth");
router.get("/google", (req, res) => {
  res.redirect(getAuthUrl());
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  req.session.tokens = tokens;
  res.send("Google login success ✔");
});

module.exports = router;
