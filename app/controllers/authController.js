import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import("dotenv/config");

import userRepository from "../repositories/userRepository.js";
import validate from "../helpers/validator.js";
import schema from "../helpers/schema.js";
import { ReqError } from "../helpers/appError.js";
import errorCodes from "../constants/errorCodes.js";

async function login(req, res) {
  const { email, password } = req.body;

  validate(schema.email, { email });
  validate(schema.password, { password });

  const user = await userRepository.findByCredential("email", email);
  if (!user) throw new ReqError(errorCodes.INVALID_USER, { message: "Email atau password salah" }, 401);

  const hashedPassword = user.password;
  const isPasswordMatch = bcrypt.compareSync(password, hashedPassword);
  if (!isPasswordMatch) throw new ReqError(errorCodes.INVALID_USER, { message: "Email atau password salah" }, 401);

  const payload = {
    username: user.username,
    role: user.role,
    status: user.status,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.status(202).json({ statusCode: 202, message: "Login berhasil", data: { token } });
}

export default { login };
