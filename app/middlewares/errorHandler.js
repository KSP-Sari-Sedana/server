import { APIError, ReqError } from "../helpers/appError.js";
import debug from "debug";

const log = debug("server");

const errorHandler = (error, req, res, next) => {
  log(error);

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
    });
  }

  if (error instanceof ReqError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      error: error.errorStack,
    });
  }

  return res.status(500).json({ message: "Internal server error" });
};

export default errorHandler;
