module.exports = {
  error(code, errors) {
    const result = {};
    result.isSuccess = false;
    result.code = code;
    result.errors = errors;
    return result;
  },
  success(code, payload) {
    const result = {};
    result.isSuccess = true;
    result.code = code;
    result.payload = payload;
    return result;
  }
};
