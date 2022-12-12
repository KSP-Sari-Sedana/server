import express from "express";
const router = express.Router();

import userControllers from "../controllers/userController.js";
import authController from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.post("/", tryCatch(userControllers.register));
router.get("/:username", tryCatch(authController.authorize), tryCatch(userControllers.getByUsername));

export default router;
