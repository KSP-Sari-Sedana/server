let express = require("express");
let path = require("path");
let cookieParser = require("cookie-parser");
let morgan = require("morgan");
require("dotenv").config();

const routes = require("./app/routes/index-route");

let app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const baseURL = `/api/${process.env.API_VERSION}`
app.use(baseURL, routes);

module.exports = app;
