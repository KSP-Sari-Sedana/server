const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  res.json({ status: "server running" });
});

module.exports = router;
