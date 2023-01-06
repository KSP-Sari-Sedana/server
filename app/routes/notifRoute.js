import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";
import notifController from "../controllers/notifController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(authController.authorize), tryCatch(notifController.get));

export default router;
