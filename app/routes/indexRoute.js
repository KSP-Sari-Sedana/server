import express from "express";
const router = express.Router();

import userRoute from "./userRoute.js";
import authRoute from "./authRoute.js";
import docRoute from "./docRoute.cjs";
import productRoute from "./productRoute.js";
import notifRoute from "./notifRoute.js";
import subm from "./submRoute.js";
import trans from "./transRoute.js";
import acc from "./accRoute.js";

router.get("/", (req, res) => {
  res.json({ message: "server running" });
});

router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/docs", docRoute);
router.use("/products", productRoute);
router.use("/notif", notifRoute);
router.use("/subm", subm);
router.use("/trans", trans);
router.use("/acc", acc);

export default router;
