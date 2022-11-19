const validator = require("validator");
const response = require("../helpers/response");

module.exports = {
  formatCredential(key, value) {
    switch (key) {
      case "email":
        if (!validator.isEmail(value)) throw response.error(400, { isAppropriate: false, message: `format ${key} salah` });
        break;
      case "username":
        if (!validator.isAlpha(value)) throw response.error(400, { isAppropriate: false, message: `${key} hanya boleh huruf` });
        if (!validator.isLength(value, { min: 3, max: 20 })) throw response.error(400, { isAppropriate: false, message: `${key} harus 3-20 karakter` });
        break;
      case "telephone":
        if (!validator.isMobilePhone(value, ["id-ID"])) throw response.error(400, { isAppropriate: false, message: `format ${key} salah` });
        break;
      case "nip":
        if (!validator.isNumeric(value)) throw response.error(400, { isAppropriate: false, message: `${key.toLocaleUpperCase()} hanya boleh angka` });
        if (!validator.isLength(value, { min: 16, max: 18 })) throw response.error(400, { isAppropriate: false, message: `${key.toLocaleUpperCase()} harus 16-18 karakter` });
        break;
      case "password":
        if (!validator.isStrongPassword(value)) throw response.error(400, { isAppropriate: false, message: `pilih ${key} yang lebih kuat` });
        break;
      default:
        throw response.error(400, { isAppropriate: false, message: `format ${key} tidak ditemukan` });
    }
  },
};
