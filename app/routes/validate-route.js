const express = require("express");
const router = express.Router();

const validateController = require("../controllers/validate-controller");

router.get("/", validateController.checkFormatDataType);

module.exports = router;
