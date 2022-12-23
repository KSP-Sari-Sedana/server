class ExtendableError extends Error {
  constructor(errorCode, message, statusCode) {
    super(message);

    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
  }
}

class APIError extends ExtendableError {
  constructor(errorCode, message, statusCode) {
    super(errorCode, message, statusCode);
  }
}

class ReqError extends ExtendableError {
  constructor(errorCode, message, errorStack, statusCode) {
    super(errorCode, message, statusCode);

    this.message = message;
    this.errorStack = errorStack;
  }
}

export { APIError, ReqError };
