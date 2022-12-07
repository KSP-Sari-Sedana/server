import fs from "fs";

import productRepository from "../repositories/productRepository.js";
import errorCodes from "../constants/errorCodes.js";
import { ReqError } from "../helpers/appError.js";
import validate from "../helpers/validator.js";
import schema from "../helpers/schema.js";

async function get(req, res) {
  const products = await productRepository.findAll();
  res.status(200).json({ statusCode: 200, message: "Sukses mendapatkan semua produk", data: { products } });
}

async function create(req, res) {
  const { role, status } = req.user;
  if (role !== "admin" || status !== "aktif") {
    throw new ReqError(errorCodes.NOT_ADMIN, { message: "Anda tidak memiliki akses untuk membuat produk" }, 403);
  }

  let { namaProduk, fotoProduk, deskripsiProduk, bungaProduk, tipeProduk, setoranProduk, tenorProduk, angsuranProduk } = req.body;

  validate(schema.namaProduk, { namaProduk });
  validate(schema.deskripsiProduk, { deskripsiProduk });
  validate(schema.bungaProduk, { bungaProduk });
  validate(schema.tipeProduk, { tipeProduk });
  validate(schema.setoranProduk, { setoranProduk });
  validate(schema.tenorProduk, { tenorProduk });
  validate(schema.angsuranProduk, { angsuranProduk });

  const ext = fotoProduk.split(";")[0].match(/png|jpg|jpeg|svg/gi)?.[0];
  if (ext === undefined) {
    throw new ReqError(errorCodes.INVALID_FILE, { message: "File yang diupload tidak valid" }, 400);
  }

  const base64 = fotoProduk.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const fileName = `${new Date().toISOString().split("T")[0].replace(/-/gim, "")}_${namaProduk.toString().toLowerCase().replace(/(\s)/g, "-")}.${ext}`;
  const filePath = `images/product/${fileName}`;
  fs.writeFileSync(`./public/${filePath}`, buffer);

  const { insertId } = await productRepository.create(namaProduk, filePath, deskripsiProduk, bungaProduk, tipeProduk, setoranProduk, tenorProduk, angsuranProduk);
  const product = await productRepository.findById(insertId);
  res.status(201).json({ statusCode: 201, message: "Suskes membuat produk", data: { product: product[0] } });
}

export default { get, create };
