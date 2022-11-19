const userRepository = require("../repositories/user-repository");
const validator = require("../helpers/validator");
const response = require("../helpers/response");

module.exports = {
  async checkTakenCredential(data) {
    const key = Object.keys(data)[0];
    const value = Object.values(data)[0];

    validator.formatCredential(key, value);

    const result = await userRepository.findByCredential(key, value);
    if (result) return response.success(200, { isTaken: true, message: `gunakan ${key} lain` });
    else return response.success(200, { isTaken: false, message: `${key} ${value} tersedia` });
  },
};
