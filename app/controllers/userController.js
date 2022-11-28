import bcrypt from "bcryptjs";

import userRepository from "../repositories/userRepository.js";
import errorCodes from "../constants/errorCodes.js";
import { ReqError } from "../helpers/appError.js";
import validate from "../helpers/validator.js";
import schema from "../helpers/schema.js";

/**
 * @description Register a new user
 * @param {Object} req.body
 * @returns {Response} res.json
 * @auth Public
 */
async function register(req, res) {
  let { username, namaDepan, namaBelakang, email, password } = req.body;

  validate(schema.username, { username: username });
  validate(schema.email, { email: email });
  validate(schema.namaDepan, { namaDepan: namaDepan });
  validate(schema.namaBelakang, { namaBelakang: namaBelakang });
  validate(schema.password, { password: password });

  const isUsername = await userRepository.findByCredential("username", username);
  if (isUsername) {
    throw new ReqError(errorCodes.USERNAME_ALREADY_EXIST, { message: "Username tidak tersedia", flag: "username" }, 409);
  }
  const isEmail = await userRepository.findByCredential("email", email);
  if (isEmail) {
    throw new ReqError(errorCodes.EMAIL_ALREADY_EXIST, { message: "Email tidak tersedia", flag: "email" }, 409);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  namaDepan = namaDepan[0].toUpperCase() + namaDepan.slice(1);
  namaBelakang = namaBelakang[0].toUpperCase() + namaBelakang.slice(1);

  const user = await userRepository.create(username, namaDepan, namaBelakang, email, hashedPassword);

  res.status(201).json({ statusCode: 201, message: "Registrasi berhasil", data: user });
}

export default { register };
