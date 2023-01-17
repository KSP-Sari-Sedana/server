import fs from "fs";
import("dotenv/config");

import productRepository from "../repositories/productRepository.js";
import userRepository from "../repositories/userRepository.js";
import transRepository from "../repositories/transRepository.js";
import errorCode from "../constants/errorCode.js";
import { ReqError, APIError } from "../helpers/appError.js";
import validate from "../helpers/validator.js";
import schema from "../helpers/schema.js";
import { APISuccess } from "../helpers/response.js";

function writeFile(image, name) {
  const ext = image.split(";")[0].match(/png|jpg|jpeg|svg/gi)?.[0];
  if (ext === undefined) {
    throw new ReqError(errorCode.INVALID_FILE, "File yang diupload tidak valid", { flag: "extension" }, 400);
  }

  const base64 = image.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const fileName = `${new Date().toISOString().split("T")[0].replace(/-/gim, "")}_${name.toString().toLowerCase().replace(/(\s)/g, "-")}.${ext}`;
  let filePath = `images/product/${fileName}`;
  fs.writeFileSync(`./public/${filePath}`, buffer);
  filePath = process.env.URL + "/" + filePath;

  return filePath;
}

async function get(req, res) {
  const { status } = req.query;

  let products;
  if (status) products = await productRepository.findByStatus(status);
  else products = await productRepository.findAll();
  res.status(200).json(APISuccess("Berhasil mendapatkan produk", { products }));
}

async function getById(req, res) {
  const { id } = req.params;
  const product = await productRepository.findById(id);
  if (!product) throw new ReqError(errorCode.NOT_FOUND, "Produk tidak ditemukan", { flag: "id" }, 404);
  res.status(200).json(APISuccess("Berhasil mendapatkan produk", { product }));
}

async function create(req, res) {
  if (req.user.role !== "Admin" || req.user.status !== "Aktif") {
    throw new ReqError(errorCode.NOT_ADMIN, "Anda tidak memiliki akses untuk membuat produk", { flag: "role or status" }, 403);
  }

  let { name, image, description, interest, type, deposit, tenor, installment, status } = req.body;

  validate(schema.productName, { productName: name });
  validate(schema.productDescription, { productDescription: description });
  validate(schema.productInterest, { productInterest: interest });
  validate(schema.productType, { productType: type });
  validate(schema.productDeposit, { productDeposit: deposit });
  validate(schema.productTenor, { productTenor: tenor });
  validate(schema.productInstallment, { productInstallment: installment });

  let filePath = "";
  if (image) {
    filePath = writeFile(image, name);
  }

  const { insertId } = await productRepository.create(name, `${filePath === "" ? null : filePath}`, description, interest, type, deposit, tenor, installment, status);
  const product = await productRepository.findById(insertId);
  res.status(201).json(APISuccess("Berhasil membuat produk", { product }));
}

async function update(req, res) {
  if (req.user.role !== "Admin" || req.user.status !== "Aktif") {
    throw new ReqError(errorCode.NOT_ADMIN, "Anda tidak memiliki akses untuk mengubah produk", { flag: "role or status" }, 403);
  }

  const { id } = req.params;
  const product = await productRepository.findById(id);
  if (!product) throw new ReqError(errorCode.NOT_FOUND, "Produk tidak ditemukan", { flag: "id" }, 404);

  let { name, image, description, interest, type, deposit, tenor, installment, status } = req.body;

  validate(schema.productName, { productName: name });
  validate(schema.productDescription, { productDescription: description });
  validate(schema.productInterest, { productInterest: interest });
  validate(schema.productType, { productType: type });
  validate(schema.productDeposit, { productDeposit: deposit });
  validate(schema.productTenor, { productTenor: tenor });
  validate(schema.productInstallment, { productInstallment: installment });

  let filePath = "";
  if (image) {
    filePath = writeFile(image, name);
  } else {
    product.image = null;
  }

  name = name ? name : product.name;
  image = image ? filePath : product.image;
  description = description ? description : product.description;
  interest = interest ? interest : product.interest;
  type = type ? type : product.type;
  deposit = deposit ? deposit : product.deposit;
  tenor = tenor ? tenor : product.tenor;
  installment = installment ? installment : product.installment;
  status = status ? status : product.status;

  await productRepository.update(id, name, image, description, interest, type, deposit, tenor, installment, status);
  const updatedProduct = await productRepository.findById(id);
  res.status(200).json(APISuccess("Berhasil mengubah produk", { product: updatedProduct }));
}

async function calculate(req, res) {
  const { tenor, installment, loanFund, interestType } = req.body;

  const product = await productRepository.findById(req.params.id);
  if (product === undefined) {
    throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "Produk tidak ditemukan", { flag: "product" }, 404);
  }

  if (product.type === "Simpanan") {
    if (tenor === undefined) {
      throw new ReqError(errorCode.INVALID_TENOR, "Tenor tidak boleh kosong", { flag: "tenor" }, 400);
    } else if (installment === undefined) {
      throw new ReqError(errorCode.INVALID_INSTALLMENT, "Angsuran tidak boleh kosong", { flag: "installment" }, 400);
    }
  } else if (product.type === "Pinjaman") {
    if (loanFund === undefined || loanFund === 0) {
      throw new ReqError(errorCode.INVALID_LOAN, "Dana pinjaman tidak boleh kosong", { flag: "loan" }, 400);
    } else if (loanFund < 5000000) {
      throw new ReqError(errorCode.INVALID_LOAN, "Dana pinjaman minimal Rp 5.000.000", { flag: "loan" }, 400);
    } else if (tenor === undefined) {
      throw new ReqError(errorCode.INVALID_TENOR, "Tenor tidak boleh kosong", { flag: "tenor" }, 400);
    } else if (interestType === undefined) {
      throw new ReqError(errorCode.INVALID_INTEREST, "Jenis bunga pinjaman tidak boleh kosong", { flag: "interest" }, 400);
    } else if (interestType !== "Menurun" && interestType !== "Tetap") {
      throw new ReqError(errorCode.INVALID_INTEREST, "Pilihan jenis bunga menurun atau tetap", { flag: "interest" }, 400);
    }
  }

  if (product.tenor.length > 0) {
    const result = product.tenor.filter((number) => number === tenor);
    if (result.length === 0) {
      throw new ReqError(errorCode.INVALID_TENOR, "Tenor tidak tersedia", { flag: "tenor" }, 400);
    }
  }

  if (product.installment.length > 0) {
    const result = product.installment.filter((number) => number === installment);
    if (result.length === 0) {
      throw new ReqError(errorCode.INVALID_INSTALLMENT, "Angsuran tidak tersedia", { flag: "installment" }, 400);
    }
  }

  let interest = 0;
  let profit = 0;
  let total = 0;

  if (product.type === "Simpanan") {
    if (product.deposit === "Bulanan") {
      total = installment * tenor;
      interest = (product.interest / 100) * total;
      profit = total + interest * (tenor / 12);
    } else if (product.deposit === "Harian") {
      total = installment * (tenor * 30);
      interest = (product.interest / 100) * total;
      profit = total + interest;
    }
    res.status(200).json(APISuccess("Sukses melakukan kalkulasi", { total, interest, profit }));
    return;
  } else if (product.type === "Pinjaman") {
    let principal = 0;
    let installment = [];

    let administrative = 0;
    let insurance = (1 / 100) * loanFund;
    let provision = 0;
    let mandatorySavings = (0.5 / 100) * loanFund;
    let notary = 0;
    let checkingFee = 300000;
    let stampDuty = 30000;

    if (loanFund <= 5000000) {
      administrative = (3 / 100) * loanFund;
      provision = (1 / 100) * loanFund;
      notary = 1200000;
    } else if (loanFund <= 25000000) {
      administrative = (3 / 100) * loanFund;
      provision = (1 / 100) * loanFund;
      notary = 1200000;
    } else if (loanFund <= 50000000) {
      administrative = (3 / 100) * loanFund;
      provision = (1 / 100) * loanFund;
      notary = 1300000;
    } else if (loanFund <= 100000000) {
      administrative = (2.75 / 100) * loanFund;
      provision = (1 / 100) * loanFund;
      notary = 1500000;
    } else if (loanFund <= 150000000) {
      administrative = (2.3 / 100) * loanFund;
      provision = (1 / 100) * loanFund;
      notary = 1500000;
    } else if (loanFund >= 150000000) {
      administrative = (1.95 / 100) * loanFund;
      provision = (0.5 / 100) * loanFund;
      notary = 1500000;
    }

    let loanBalance = loanFund;
    let receivedAmount = loanFund - (administrative + insurance + provision + mandatorySavings + notary + checkingFee + stampDuty);
    let deductionAmount = administrative + insurance + provision + mandatorySavings + notary + checkingFee + stampDuty;
    const terms = { administrative, insurance, provision, mandatorySavings, notary, checkingFee, stampDuty };

    for (let i = 1; i <= tenor; i++) {
      principal = 100 * Math.ceil(Math.floor(loanFund / tenor) / 100);
      interest = 100 * Math.ceil(Math.floor(interestType === "Menurun" ? loanBalance * (product.interest / 100) : loanFund * (product.interest / 100)) / 100);
      loanBalance = Number(loanBalance - principal);
      total = Number(principal + interest);

      installment.push({ principal, interest, total, loanBalance });
    }
    res.status(200).json(APISuccess("Sukses melakukan kalkulasi", { terms, deductionAmount, receivedAmount, installment }));
    return;
  }
}

async function getConsumedProducts(req, res) {
  const { type } = req.params;
  const { username } = req.query;

  if (type !== "saving" && type !== "loan") {
    throw new ReqError(errorCode.INVALID_PRODUCT_TYPE, "Tipe produk tidak valid", { flag: "type" }, 400);
  }

  if (username) {
    if ((req.user.role !== "Admin" && req.user.role !== "Teller") || req.user.status !== "Aktif") throw new APIError(errorCode.RESOURCE_FORBIDDEN, "Anda tidak memiliki akses", 401);

    const user = await userRepository.findByCredential("username", username);
    if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

    const consumedProducts = await productRepository.findConsumed(user.id, type);
    res.status(200).json(APISuccess("Sukses mendapatkan data produk", { consumedProducts }));
    return;
  }

  const consumedProducts = await productRepository.findConsumed(req.user.id, type);
  res.status(200).json(APISuccess("Sukses mendapatkan data produk", { consumedProducts }));
}

async function getConsumedProductById(req, res) {
  const { username } = req.user;
  const { type, id } = req.params;

  if (type !== "saving" && type !== "loan") {
    throw new ReqError(errorCode.INVALID_PRODUCT_TYPE, "Tipe produk tidak valid", { flag: "type" }, 400);
  }

  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  const consumedProduct = await productRepository.findConsumedById(id, type);
  if (!consumedProduct) throw new APIError(errorCode.INVALID_CONSUMED_PRODUCT, "Produk tidak ditemukan", 404);

  if (consumedProduct.userId !== user.id) throw new APIError(errorCode.INVALID_CONSUMED_PRODUCT, "Produk tidak ditemukan", 404);

  let transDetail = undefined;

  if (type === "saving") {
    let balance = 0;

    transDetail = await transRepository.findTransById(id, type);
    for (let i = 0; i < transDetail.length; i++) {
      const debit = transDetail[i].debit;
      const credit = transDetail[i].credit;

      if (transDetail[i].code === "Setoran" || transDetail[i].code === "Bunga") {
        balance += debit;
      } else if (transDetail[i].code === "Penarikan" || transDetail[i].code === "Administrasi") {
        balance -= credit;
      }

      transDetail[i].balance = balance;
    }

    transDetail.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  if (type === "loan") {
    let loanBalance = consumedProduct.loanFund;

    transDetail = await transRepository.findTransById(id, type);

    transDetail.forEach((transaction) => {
      transaction.total = transaction.principal + transaction.interest + transaction.penaltyFee;
      loanBalance -= transaction.total - transaction.penaltyFee;
      transaction.loanBalance = loanBalance;
    });

    transDetail.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  consumedProduct.transDetail = transDetail;
  res.status(200).json(APISuccess("Sukses mendapatkan data angsuran produk", { consumedProduct }));
}

export default { get, getById, create, update, calculate, getConsumedProducts, getConsumedProductById };
