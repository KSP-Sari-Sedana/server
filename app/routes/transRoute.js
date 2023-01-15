import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";
import transController from "../controllers/transController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(authController.authorize), tryCatch(transController.get));
router.post("/:type/:id", tryCatch(authController.authorize), tryCatch(transController.create));

export default router;
