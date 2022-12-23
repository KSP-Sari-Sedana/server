function APISuccess(message, data) {
  return {
    errorCode: null,
    status: "OK",
    message: message,
    data,
    errors: null,
  };
}

export { APISuccess };
