import app from "./config/express.js";
import debug from "debug";
import http from "http";

import "dotenv/config";

const log = debug("server");

function normalizePort(val) {
  let port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  } else if (port >= 0) {
    return port;
  }
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  log("listening on " + bind);
}

const port = normalizePort(process.env.PORT || 3000);
app.set("port", port);

const server = http.createServer(app);
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);
