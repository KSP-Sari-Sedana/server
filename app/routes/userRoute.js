import express from "express";
const router = express.Router();

import userController from "../controllers/userController.js";
import authController from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.post("/", tryCatch(userController.register));
router.get("/", tryCatch(authController.authorize), tryCatch(userController.getMyProfile));
router.get("/:username", tryCatch(authController.authorize), tryCatch(userController.getByUsername));
router.get("/filter/all", tryCatch(authController.authorize), tryCatch(userController.get));

export default router;
