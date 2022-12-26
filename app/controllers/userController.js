import bcrypt from "bcryptjs";

import userRepository from "../repositories/userRepository.js";
import errorCode from "../constants/errorCode.js";
import { ReqError, APIError } from "../helpers/appError.js";
import validate from "../helpers/validator.js";
import schema from "../helpers/schema.js";
import { APISuccess } from "../helpers/response.js";

async function register(req, res) {
  let { username, firstName, lastName, email, password } = req.body;

  validate(schema.username, { username });
  validate(schema.email, { email });
  validate(schema.firstName, { firstName });
  validate(schema.lastName, { lastName });
  validate(schema.password, { password });

  const isUsername = await userRepository.findAvailableCredential("username", username);
  if (isUsername) {
    throw new ReqError(errorCode.USERNAME_ALREADY_EXIST, "Username tidak tersedia", { flag: "username" }, 409);
  }
  const isEmail = await userRepository.findAvailableCredential("email", email);
  if (isEmail) {
    throw new ReqError(errorCode.EMAIL_ALREADY_EXIST, "Email tidak tersedia", { flag: "email" }, 409);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  namaDepan = namaDepan[0].toUpperCase() + namaDepan.slice(1);
  namaBelakang = namaBelakang[0].toUpperCase() + namaBelakang.slice(1);

  const user = await userRepository.create(username, namaDepan, namaBelakang, email, hashedPassword);

  res.status(201).json(APISuccess("Registrasi berhasil", { user }));
}

async function getByUsername(req, res) {
  validate(schema.username, { username: req.params.username });

  const { role, status } = req.user;

  if ((role !== "Admin" && role !== "Teller") || status !== "Aktif") {
    throw new APIError(errorCode.RESOURCE_FORBIDDEN, "Akses mendapatkan data user ditolak", 403);
  }

  const user = await userRepository.findByCredential("username", req.params.username);
  if (!user) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "User tidak ditemukan", { flag: "username" }, 404);

  delete user.password;

  res.status(200).json(APISuccess("Sukses mendapatkan user", { user }));
}

async function myIdentity(req, res) {
  const { username } = req.user;

  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "User tidak ditemukan", { flag: "username" }, 404);

  delete user?.password;

  res.status(200).json(APISuccess("Sukses mendapatkan data diri", { user }));
}

export default { register, getByUsername, myIdentity };
