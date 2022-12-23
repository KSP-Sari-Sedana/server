import { APIError, ReqError } from "../helpers/appError.js";
import debug from "debug";
import errorCode from "../constants/errorCode.js";

const log = debug("server");

const errorHandler = (error, req, res, next) => {
  log(error);

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      status: error.name,
      message: null,
      data: null,
      errors: null,
    });
  }

  if (error instanceof ReqError) {
    return res.status(error.statusCode).json({
      errorCode: error.errorCode,
      status: error.name,
      message: error.message,
      data: null,
      errors: error.errorStack,
    });
  }

  return res.status(500).json({ errorCode: errorCode.NOT_FOUND, status: "Error", message: "Internal server error", data: null, errors: null });
};

export default errorHandler;
