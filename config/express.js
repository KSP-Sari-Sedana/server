import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import "dotenv/config";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import routes from "../app/routes/indexRoute.js";
import errorHandler from "../app/middlewares/errorHandler.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(dirname(fileURLToPath(import.meta.url)), "../public")));

const baseURL = `/api/${process.env.API_VERSION}`;
app.use(baseURL, routes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ statusCode: 404, path: req.path, error: { message: "Not found", method: req.method } });
});

export default app;
