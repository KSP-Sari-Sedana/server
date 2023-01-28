import fs from "fs";
import bcrypt from "bcryptjs";

import userRepository from "../repositories/userRepository.js";
import notifRepository from "../repositories/notifRepository.js";
import productRepository from "../repositories/productRepository.js";
import submRepository from "../repositories/submRepository.js";
import accRepository from "../repositories/accRepository.js";
import transRepository from "../repositories/transRepository.js";
import errorCode from "../constants/errorCode.js";
import { ReqError, APIError } from "../helpers/appError.js";
import validate from "../helpers/validator.js";
import format from "../helpers/formatter.js";
import schema from "../helpers/schema.js";
import { APISuccess } from "../helpers/response.js";

function writeFile(image, name) {
  const ext = image.split(";")[0].match(/png|jpg|jpeg|svg/gi)?.[0];
  if (ext === undefined) {
    throw new ReqError(errorCode.INVALID_FILE, "File yang diupload tidak valid", { flag: "extension" }, 400);
  }

  const base64 = image.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const fileName = `${name.toString().toLowerCase().replace(/(\s)/g, "-")}.${ext}`;
  let filePath = `images/profile/${fileName}`;
  fs.writeFileSync(`./public/${filePath}`, buffer);
  filePath = process.env.URL + "/" + filePath;

  return filePath;
}

async function get(req, res) {
  const { status, role } = req.query;

  if ((req.user.role !== "Admin" && req.user.role !== "Teller") || req.user.status !== "Aktif") {
    throw new APIError(errorCode.RESOURCE_FORBIDDEN, "Akses mendapatkan data user ditolak", 403);
  }

  let users = undefined;
  if (status && role) {
    users = await userRepository.getByStatusAndRole(status, role);
  } else if (status) {
    users = await userRepository.getByStatus(status);
  } else if (role) {
    users = await userRepository.getByRole(role);
  } else {
    users = await userRepository.get();
  }

  if (!users) throw new APIError(errorCode.RESOURCE_NOT_FOUND, "User tidak ditemukan", 404);

  users.forEach((user) => {
    delete user.password;
  });

  res.status(200).json(APISuccess("Sukses mendapatkan data user", { users }));
}

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
  firstName = firstName[0].toUpperCase() + firstName.slice(1);
  lastName = lastName[0].toUpperCase() + lastName.slice(1);

  const user = await userRepository.create(username, firstName, lastName, email, hashedPassword);
  await notifRepository.create(user.id, new Date(), "Akun", "Selamat datang, lengkapi profil untuk memulai menikmati produk");

  res.status(201).json(APISuccess("Registrasi berhasil", { user }));
}

async function update(req, res) {
  let { username, email, image, firstName, lastName, cellphone, province, district, subdistrict, address, nin, job, salary, expense, oldPassword, newPassword, confirmPassword } = req.body;

  let hashedPassword = undefined;

  if (username !== req.user.username) {
    validate(schema.username, { username });
    const isUsername = await userRepository.findAvailableCredential("username", username);
    if (isUsername) throw new ReqError(errorCode.USERNAME_ALREADY_EXIST, "Username tidak tersedia", { flag: "username" }, 409);
  }
  if (email !== req.user.email) {
    validate(schema.email, { email });
    const isEmail = await userRepository.findAvailableCredential("email", email);
    if (isEmail) throw new ReqError(errorCode.EMAIL_ALREADY_EXIST, "Email tidak tersedia", { flag: "email" }, 409);
  }

  const user = await userRepository.findByCredential("username", req.user.username);
  if (!user) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "User tidak ditemukan", { flag: "username" }, 404);

  if (oldPassword) {
    validate(schema.password, { password: oldPassword });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new ReqError(errorCode.PASSWORD_NOT_MATCH, "Password lama salah", { flag: "oldPassword" }, 400);

    if (newPassword !== confirmPassword || newPassword === "" || confirmPassword === "") throw new ReqError(errorCode.PASSWORD_NOT_MATCH, "Password baru tidak sama", { flag: "confirmPassword" }, 400);
    validate(schema.password, { password: newPassword });

    const salt = await bcrypt.genSalt(10);
    hashedPassword = await bcrypt.hash(newPassword, salt);
  }

  let filePath = "";
  if (image) {
    let url = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
    if (!url.test(image)) {
      filePath = writeFile(image, user.username);
    }
  }

  validate(schema.firstName, { firstName });
  validate(schema.lastName, { lastName });

  username = username || user.username;
  email = email || user.email;
  image = filePath ? filePath : user.image;
  firstName = firstName || user.firstName;
  lastName = lastName || user.lastName;
  cellphone = cellphone || user.cellphone;
  province = province || user.province;
  district = district || user.district;
  subdistrict = subdistrict || user.subdistrict;
  address = address || user.address;
  nin = nin || user.nin;
  job = job || user.job;
  salary = salary || user.salary;
  expense = expense || user.expense;
  oldPassword = hashedPassword || user.password;

  firstName = firstName[0].toUpperCase() + firstName.slice(1);
  lastName = lastName[0].toUpperCase() + lastName.slice(1);

  await userRepository.update(user.id, username, email, image, firstName, lastName, cellphone, province, district, subdistrict, address, nin, job, salary, expense, oldPassword);

  const updatedUser = await userRepository.findByCredential("username", username);
  delete updatedUser.password;
  res.status(200).json(APISuccess("Sukses mengubah data diri", { user: updatedUser }));
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

async function getMyProfile(req, res) {
  const { username } = req.user;

  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "User tidak ditemukan", { flag: "username" }, 404);

  delete user.password;

  res.status(200).json(APISuccess("Sukses mendapatkan data diri", { user }));
}

async function setStatusAndRole(req, res) {
  if (req.user.role !== "Admin") throw new APIError(errorCode.RESOURCE_FORBIDDEN, "Akses mengubah status dan role user ditolak", 403);

  const { username } = req.params;
  const { status, role } = req.body;

  let user = await userRepository.findByCredential("username", username);
  if (!user) throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "User tidak ditemukan", { flag: "username" }, 404);

  const mandatoryConsumed = await productRepository.findMandatoryConsumed(user.id);
  if (mandatoryConsumed.length <= 0 && (role === "Admin" || role === "Teller" || role === "Anggota") && status === "Aktif") {
    const mandatoryProduct = await productRepository.findByStatus("Wajib");
    let mandatorySubm = [];
    for (let i = 0; i < mandatoryProduct.length; i++) {
      mandatorySubm.push({
        productId: mandatoryProduct[i].id,
        productName: mandatoryProduct[i].name,
        userId: user.id,
        productType: mandatoryProduct[i].type === "Simpanan" ? "saving" : "loan",
        deposit: mandatoryProduct[i].deposit === "Sekali" ? "Selesai" : "Berjalan",
        installment: mandatoryProduct[i].installment[0],
        tenor: mandatoryProduct[i].tenor[0] || 0,
        submDate: new Date(),
        status: "Diterima",
      });
    }

    await notifRepository.create(user.id, new Date(), "Akun", "Akun telah aktif, Anda kini dapat menikmati produk");

    mandatorySubm.map(async (subm, index) => {
      setTimeout(async () => {
        try {
          const submission = await submRepository.create(subm.userId, subm.productType, subm);
          await notifRepository.create(subm.userId, new Date(), "Pengajuan", `Pengajuan produk ${submission.productName} sudah diterima. Admin sedang meninjau pengajuan Anda`);
          const acc = await accRepository.create(submission.submId, subm.productType, { status: subm.deposit, realDate: new Date() });
          setTimeout(async () => {
            await notifRepository.create(
              subm.userId,
              new Date(),
              "Pengajuan",
              `Pengajuan produk ${subm.productName} tanggal ${submission.submDate.toLocaleString("ID-id", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })} telah diterima oleh Admin`
            );
          }, 2000 * (index + 1));
          await transRepository.create(acc.accId, subm.productType, { code: "Setoran", debit: subm.installment, credit: 0, transDate: new Date() });
          setTimeout(async () => {
            await notifRepository.create(
              subm.userId,
              new Date(),
              "Transaksi",
              `Transaksi dilakukan pada rekening ${format.accNumber(acc.accNumber)} sebesar Rp. ${subm.installment.toLocaleString("ID-id")}`
            );
          }, 3000 * (index + 1));
        } catch (error) {}
      }, 1000 * (index + 1));
    });
  }

  await userRepository.updateStatusAndRole(username, status, role);
  user = await userRepository.findByCredential("username", username);

  delete user.password;

  res.status(200).json(APISuccess("Sukses mengubah status dan role user", { user }));
}

export default { get, register, update, getByUsername, getMyProfile, setStatusAndRole };
