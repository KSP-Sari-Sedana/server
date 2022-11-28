import express from "express";
const router = express.Router();

import productControllers from "../controllers/productController.js";
import tryCatch from "../utils/tryCatch.js";

router.route("/").get(tryCatch(productControllers.get));

export default router;
