const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/user-controller");

router.get("/credentials/taken", userControllers.checkTakenCredential);
router.post("/register", userControllers.register);

module.exports = router;
