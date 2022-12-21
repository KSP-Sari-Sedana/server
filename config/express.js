import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import routes from "../app/routes/indexRoute.js";
import errorHandler from "../app/middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(dirname(fileURLToPath(import.meta.url)), "../public")));

const baseURL = `/api/${process.env.API_VERSION}`;
app.use(baseURL, routes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ method: req.method, error: { message: "Path not found" } });
});

export default app;
