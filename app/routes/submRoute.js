import express from "express";
const router = express.Router();

import authController from "../controllers/authController.js";
import submController from "../controllers/submController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(authController.authorize), tryCatch(submController.getByUser));
router.get("/:type", tryCatch(authController.authorize), tryCatch(submController.get));
router.post("/:type", tryCatch(authController.authorize), tryCatch(submController.create));
router.get("/:type/:id", tryCatch(authController.authorize), tryCatch(submController.getSubmById));
router.delete("/:type/:id", tryCatch(authController.authorize), tryCatch(submController.cancelSubm));

export default router;
