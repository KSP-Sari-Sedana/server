import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.post("/login", tryCatch(authController.login));
router.get("/", tryCatch(authController.authorize), tryCatch(authController.isTokenValid));

export default router;
