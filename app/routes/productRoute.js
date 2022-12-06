import express from "express";
const router = express.Router();

import productControllers from "../controllers/productController.js";
import authControllers from "../controllers/authController.js";
import tryCatch from "../utils/tryCatch.js";

router.get("/", tryCatch(productControllers.get));
router.post("/", tryCatch(authControllers.authorize), tryCatch(productControllers.create));

export default router;
