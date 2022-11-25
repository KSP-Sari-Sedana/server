const userRepository = require("../repositories/user-repository");
const validator = require("../helpers/validator");
const response = require("../helpers/response");
const bcrypt = require("bcryptjs");

module.exports = {
  async checkTakenCredential(data) {
    const key = Object.keys(data)[0];
    const value = Object.values(data)[0];

    validator.formatCredential(key, value);

    const result = await userRepository.findByCredential(key, value);
    if (result) return response.success(200, { isTaken: true, message: `gunakan ${key} lain` });
    else return response.success(200, { isTaken: false, message: `${key} ${value} tersedia` });
  },

  async register(user) {
    let { username, namaDepan, namaBelakang, email, password } = user;

    validator.formatCredential("username", username);
    validator.formatNonCredential("nama depan", namaDepan);
    validator.formatNonCredential("nama belakang", namaBelakang);
    validator.formatCredential("email", email);
    validator.formatCredential("password", password);

    let result = await userRepository.findByCredential("username", username);
    if (result) return response.error(422, { message: `gunakan username lain` });
    result = await userRepository.findByCredential("email", email);
    if (result) return response.error(422, { message: `gunakan email lain` });

    password = await bcrypt.hash(user.password, 10);
    namaDepan = namaDepan[0].toUpperCase() + namaDepan.slice(1);
    namaBelakang = namaBelakang[0].toUpperCase() + namaBelakang.slice(1);

    result = await userRepository.create(username, namaDepan, namaBelakang, email, password);
    return response.success(200, { message: `registrasi berhasil`, user: result });
  },
};
