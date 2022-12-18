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
  constructor(errorCode, errorStack, statusCode) {
    super(errorCode, errorStack.message, statusCode);

    this.errorStack = errorStack;
  }
}

export { APIError, ReqError };
