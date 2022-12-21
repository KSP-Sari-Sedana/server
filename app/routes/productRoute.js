import express from "express";
const router = express.Router();

import productController from "../controllers/productController.js";
import authController from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(productController.get));
router.post("/", tryCatch(authController.authorize), tryCatch(productController.create));
router.get("/calculate/:id", tryCatch(productController.calculate));

export default router;
