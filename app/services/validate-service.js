const validator = require("../helpers/validator");
const response = require("../helpers/response");

module.exports = {
  checkFormatDataType(data) {
    const key = Object.keys(data)[0];
    const value = Object.values(data)[0];
    validator.formatDataType(key, value);
    return response.success(200, { isAppropriate: true });
  },
};
