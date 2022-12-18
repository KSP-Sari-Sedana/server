import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import("dotenv/config");

import userRepository from "../repositories/userRepository.js";
import validate from "../helpers/validator.js";
import schema from "../helpers/schema.js";
import { APIError, ReqError } from "../helpers/appError.js";
import errorCode from "../constants/errorCode.js";

async function login(req, res) {
  const { email, password } = req.body;

  validate(schema.email, { email });
  validate(schema.password, { password });

  const user = await userRepository.findByCredential("email", email);
  if (!user) throw new ReqError(errorCode.INVALID_USER, { message: "Email atau password salah" }, 401);

  const hashedPassword = user.password;
  const isPasswordMatch = bcrypt.compareSync(password, hashedPassword);
  if (!isPasswordMatch) throw new ReqError(errorCode.INVALID_USER, { message: "Email atau password salah" }, 401);

  const payload = {
    username: user.username,
    role: user.role,
    status: user.status,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  res.status(202).json({ statusCode: 202, message: "Login berhasil", data: { token } });
}

async function authorize(req, res, next) {
  const bearerToken = req.headers.authorization;
  const token = bearerToken?.split("Bearer ")[1];
  const tokenPayload = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) throw new APIError(errorCode.INVALID_TOKEN, "Token tidak valid", 401);
    return decoded;
  });

  req.user = await userRepository.findByCredential("username", tokenPayload.username);
  if (!req.user) throw new APIError(errorCode.INVALID_TOKEN, "Token tidak valid", 401);
  next();
}

export default { login, authorize };
