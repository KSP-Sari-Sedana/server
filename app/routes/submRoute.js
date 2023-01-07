import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";
import submController from "../controllers/submController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(authController.authorize), tryCatch(submController.get));

export default router;
