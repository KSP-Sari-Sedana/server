import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import "dotenv/config";

import routes from "../app/routes/indexRoute.js";
import errorHandler from "../app/middlewares/errorHandler.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const baseURL = `/api/${process.env.API_VERSION}`;
app.use(baseURL, routes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).send(`${req.path} not found!`);
});

export default app;
