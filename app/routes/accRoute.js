import express from "express";
const router = express.Router();

import accController from "../controllers/accController.js";
import authController from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.put("/:type/:id", tryCatch(authController.authorize), tryCatch(accController.setStatus));

export default router;
