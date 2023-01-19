import express from "express";
const router = express.Router();

import summaryController from "../controllers/summaryController.js";
import authController from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(authController.authorize), tryCatch(summaryController.getSummary));

export default router;
