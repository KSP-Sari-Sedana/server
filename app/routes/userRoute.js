import express from "express";
const router = express.Router();

import userControllers from "../controllers/userController.js";
import tryCatch from "../utils/tryCatch.js";

router.post("/", tryCatch(userControllers.register));

export default router;
