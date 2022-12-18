import express from "express";
const router = express.Router();

import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js";
import docRoute from "./docRoute.cjs";
import productRoute from "./productRoute.js";

router.get("/", (req, res) => {
  res.json({ message: "server running" });
});

router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/docs", docRoute);
router.use("/products", productRoute);

export default router;
