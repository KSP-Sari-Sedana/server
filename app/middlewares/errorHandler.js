import { APIError, ReqError } from "../helpers/appError.js";
import debug from "debug";

const log = debug("server");

const errorHandler = (error, req, res, next) => {
  log(error.name);
  log(error);

  if (error.name === "ValidationError") {
    return res.status(400).send({
      type: "Validation Error",
      details: error.details,
    });
  }

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      statusCode: error.statusCode,
    });
  }

  if (error instanceof ReqError) {
    return res.status(error.statusCode).json({
      ...error,
    });
  }

  return res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
