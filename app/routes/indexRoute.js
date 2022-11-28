import express from "express";
const router = express.Router();

import userRoutes from "./userRoute.js";
import authRoutes from "./authRoute.js";
import docRoutes from "./docRoute.cjs";
import productRoutes from "./productRoute.js";

router.get("/", (req, res) => {
  res.json({ message: "server running" });
});

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/docs", docRoutes);
router.use("/products", productRoutes);

export default router;
