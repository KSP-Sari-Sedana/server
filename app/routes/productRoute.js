import express from "express";
const router = express.Router();

import productController from "../controllers/productController.js";
import authController from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(productController.get));
router.post("/", tryCatch(authController.authorize), tryCatch(productController.create));
router.get("/:id", tryCatch(productController.getById));
router.put("/:id", tryCatch(authController.authorize), tryCatch(productController.update));
router.post("/:id/calc", tryCatch(productController.calculate));
router.get("/consumed/:type", tryCatch(authController.authorize), tryCatch(productController.getConsumedProducts));
router.get("/consumed/:type/:id", tryCatch(authController.authorize), tryCatch(productController.getConsumedProductById));

export default router;
