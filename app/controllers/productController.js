import fs from "fs";

import productRepository from "../repositories/productRepository.js";
import errorCode from "../constants/errorCode.js";
import { ReqError } from "../helpers/appError.js";
import validate from "../helpers/validator.js";
import schema from "../helpers/schema.js";
import { APISuccess } from "../helpers/response.js";

async function get(req, res) {
  const products = await productRepository.findAll();
  res.status(200).json(APISuccess("Berhasil mendapatkan produk", { products }));
}

async function create(req, res) {
  const { role, status } = req.user;
  if (role !== "Admin" || status !== "Aktif") {
    throw new ReqError(errorCode.NOT_ADMIN, "Anda tidak memiliki akses untuk membuat produk", { flag: "role or status" }, 403);
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
    throw new ReqError(errorCode.INVALID_FILE, "File yang diupload tidak valid", { flag: "extension" }, 400);
  }

  const base64 = fotoProduk.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const fileName = `${new Date().toISOString().split("T")[0].replace(/-/gim, "")}_${namaProduk.toString().toLowerCase().replace(/(\s)/g, "-")}.${ext}`;
  const filePath = `images/product/${fileName}`;
  fs.writeFileSync(`./public/${filePath}`, buffer);

  const { insertId } = await productRepository.create(namaProduk, filePath, deskripsiProduk, bungaProduk, tipeProduk, setoranProduk, tenorProduk, angsuranProduk);
  const product = await productRepository.findById(insertId);
  res.status(201).json(APISuccess("Berhasil membuat produk", { product }));
}

async function calculate(req, res) {
  const { tenorProduk, angsuranProduk, danaPinjaman, jenisBunga } = req.body;

  const product = await productRepository.findById(req.params.id);
  if (product === undefined) {
    throw new ReqError(errorCode.RESOURCE_NOT_FOUND, "Produk tidak ditemukan", { flag: "product" }, 404);
  }

  if (product.tipe === "Simpanan") {
    if (tenorProduk === undefined) {
      throw new ReqError(errorCode.INVALID_TENOR, "Tenor tidak boleh kosong", { flag: "tenor" }, 400);
    } else if (angsuranProduk === undefined) {
      throw new ReqError(errorCode.INVALID_PAYMENT, "Angsuran tidak boleh kosong", { flag: "angsuran" }, 400);
    }
  } else if (product.tipe === "Pinjaman") {
    if (danaPinjaman === undefined) {
      throw new ReqError(errorCode.INVALID_LOAN, "Dana pinjaman tidak boleh kosong", { flag: "loan" }, 400);
    } else if (tenorProduk === undefined) {
      throw new ReqError(errorCode.INVALID_TENOR, "Tenor tidak boleh kosong", { flag: "tenor" }, 400);
    } else if (jenisBunga === undefined) {
      throw new ReqError(errorCode.INVALID_INTEREST, "Jenis bunga pinjaman tidak boleh kosong", { flag: "interest" }, 400);
    } else if (jenisBunga !== "Menurun" && jenisBunga !== "Tetap") {
      throw new ReqError(errorCode.INVALID_INTEREST, "Pilihan jenis bunga menurun atau tetap", { flag: "interest" }, 400);
    }
  }

  if (product?.tenor?.length > 0) {
    const tenor = product.tenor.filter((tenor) => tenor === tenorProduk);
    if (tenor.length === 0) {
      throw new ReqError(errorCode.INVALID_TENOR, "Tenor tidak tersedia", { flag: "tenor" }, 400);
    }
  }

  if (product?.angsuran?.length > 0) {
    const tenor = product.angsuran.filter((angsuran) => angsuran === angsuranProduk);
    if (tenor.length === 0) {
      throw new ReqError(errorCode.INVALID_PAYMENT, "Angsuran tidak tersedia", { flag: "angsuran" }, 400);
    }
  }

  let bunga = 0;
  let profit = 0;
  let total = 0;

  if (product.tipe === "Simpanan") {
    if (product.setoran === "Bulanan") {
      total = angsuranProduk * tenorProduk;
      bunga = (product.bunga / 100) * total;
      profit = total + bunga * (tenorProduk / 12);
    } else if (product.setoran === "Harian") {
      total = angsuranProduk * (tenorProduk * 30);
      bunga = (product.bunga / 100) * total;
      profit = total + bunga;
    }
    res.status(200).json(APISuccess("Sukses melakukan kalkulasi", { total, bunga, profit }));
    return;
  } else if (product.tipe === "Pinjaman") {
    let pokok = 0;
    let angsuran = [];

    let administrasi = 0;
    let asuransi = (1 / 100) * danaPinjaman;
    let provisi = 0;
    let simpanan = (0.5 / 100) * danaPinjaman;
    let notaris = 0;
    let pengecekan = 300000;
    let roya = 150000;
    let materai = 30000;

    if (danaPinjaman <= 5000000) {
      administrasi = (3 / 100) * danaPinjaman;
      provisi = (1 / 100) * danaPinjaman;
      notaris = 1200000;
    } else if (danaPinjaman <= 25000000) {
      administrasi = (3 / 100) * danaPinjaman;
      provisi = (1 / 100) * danaPinjaman;
      notaris = 1200000;
    } else if (danaPinjaman <= 50000000) {
      administrasi = (3 / 100) * danaPinjaman;
      provisi = (1 / 100) * danaPinjaman;
      notaris = 1300000;
    } else if (danaPinjaman <= 100000000) {
      administrasi = (2.75 / 100) * danaPinjaman;
      provisi = (1 / 100) * danaPinjaman;
      notaris = 1500000;
    } else if (danaPinjaman <= 150000000) {
      administrasi = (2.3 / 100) * danaPinjaman;
      provisi = (1 / 100) * danaPinjaman;
      notaris = 1500000;
    } else if (danaPinjaman >= 150000000) {
      administrasi = (1.95 / 100) * danaPinjaman;
      provisi = (0.5 / 100) * danaPinjaman;
      notaris = 1500000;
    }

    let sisa = danaPinjaman;
    let realisasi = danaPinjaman - (administrasi + asuransi + provisi + simpanan + notaris + pengecekan + roya + materai);
    let potongan = administrasi + asuransi + provisi + simpanan + notaris + pengecekan + roya + materai;
    const syarat = { administrasi, asuransi, provisi, simpanan, notaris, pengecekan, roya, materai };

    for (let i = 1; i <= tenorProduk; i++) {
      pokok = 100 * Math.ceil(Math.floor(danaPinjaman / tenorProduk) / 100);
      bunga = 100 * Math.ceil(Math.floor(jenisBunga === "Menurun" ? sisa * (product.bunga / 100) : danaPinjaman * (product.bunga / 100)) / 100);
      sisa = Number(sisa - pokok);
      total = Number(pokok + bunga);

      angsuran.push({ bunga, total, sisa });
    }
    res.status(200).json(APISuccess("Sukses melakukan kalkulasi", { syarat, potongan, realisasi, pokok, angsuran }));
    return;
  }
}

export default { get, create, calculate };
