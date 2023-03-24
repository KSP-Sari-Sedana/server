import submRepository from "../repositories/submRepository.js";
import userRepository from "../repositories/userRepository.js";
import accRepository from "../repositories/accRepository.js";
import notifRepository from "../repositories/notifRepository.js";
import productRepository from "../repositories/productRepository.js";
import errorCode from "../constants/errorCode.js";
import { APIError, ReqError } from "../helpers/appError.js";
import { APISuccess } from "../helpers/response.js";

async function create(req, res) {
  const { type } = req.params;
  req.body.submDate = new Date();
  const { productId, tenor, installment, loanFund, interestType } = req.body;

  if (type !== "saving" && type !== "loan") throw new ReqError(errorCode.INVALID_PRODUCT_TYPE, "Tipe produk tidak ditemukan", { flag: "type", type }, 404);

  const product = await productRepository.findById(productId);
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

  let subm = undefined;
  subm = await submRepository.create(req.user.id, type, req.body);
  if (!subm) throw new APIError(errorCode.INVALID_SUBM, "Pengajuan gagal dibuat", 500);
  await notifRepository.create(subm.userId, new Date(), "Pengajuan", `Pengajuan produk ${subm.productName} sudah diterima. Admin sedang meninjau pengajuan Anda`);
  res.status(201).json(APISuccess("Pengajuan berhasil dibuat", { subm }));
}

async function get(req, res) {
  const { username } = req.user;
  const { type } = req.params;
  const { status } = req.query;

  if (type !== "saving" && type !== "loan") throw new ReqError(errorCode.INVALID_PRODUCT_TYPE, "Tipe produk tidak ditemukan", { flag: "type", type }, 404);

  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  if (user.role !== "Admin") throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  let subms;
  if (status) {
    subms = await submRepository.findByStatus(type, status);
  } else {
    subms = await submRepository.findAll(type);
  }
  if (!subms) throw new ReqError(errorCode.INVALID_PRODUCT_TYPE, "Pengajuan tidak ditemukan", { flag: "type", type }, 404);

  res.status(200).json(APISuccess("Pengajuan berhasil didapatkan", { subms }));
}

async function getByUser(req, res) {
  const { username } = req.user;
  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  const subm = await submRepository.getByUser(user.id);

  subm.sort((a, b) => {
    return new Date(a.submDate) - new Date(b.submDate);
  });

  res.status(200).json(APISuccess("Pengajuan berhasil didapatkan", { subm }));
}

async function getSubmById(req, res) {
  const { username } = req.user;
  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  const subm = await submRepository.getById(req.params.id, req.params.type);
  if (!subm) throw new ReqError(errorCode.INVALID_SUBM, "Pengajuan tidak ditemukan", { flag: "id", type: req.params.type }, 404);

  if (user.role === "Admin") return res.status(200).json(APISuccess("Pengajuan berhasil didapatkan", { subm }));

  if (subm.userId !== user.id) throw new ReqError(errorCode.INVALID_SUBM, "Pengajuan tidak ditemukan", { flag: "id", type: req.params.type }, 404);

  res.status(200).json(APISuccess("Pengajuan berhasil didapatkan", { subm }));
}

async function update(req, res) {
  const { id, type } = req.params;

  if (req.user.role !== "Admin") throw new ReqError(errorCode.INVALID_USER, "User tidak ditemukan", { flag: "id", type }, 404);

  let subm = await submRepository.getById(id, type);
  if (!subm) throw new ReqError(errorCode.INVALID_SUBM, "Pengajuan tidak ditemukan", { flag: "id", type }, 404);

  if (subm.status === "Diterima") throw new ReqError(errorCode.INVALID_SUBM, "Pengajuan sudah diterima", { flag: "id", type }, 404);

  if (req.body.status === "Diterima") {
    if (type === "saving") {
      let payload = {
        realDate: new Date(),
      };

      await accRepository.create(subm.submId, type, payload);
    }

    if (type === "loan") {
      let administrative = 0;
      let insurance = (1 / 100) * subm.loanFund;
      let provision = 0;
      let mandatorySavings = (0.5 / 100) * subm.loanFund;
      let notary = 0;
      let checkingFee = 300000;
      let stampDuty = 30000;

      if (subm.loanFund <= 5000000) {
        administrative = (3 / 100) * subm.loanFund;
        provision = (1 / 100) * subm.loanFund;
        notary = 1200000;
      } else if (subm.loanFund <= 25000000) {
        administrative = (3 / 100) * subm.loanFund;
        provision = (1 / 100) * subm.loanFund;
        notary = 1200000;
      } else if (subm.loanFund <= 50000000) {
        administrative = (3 / 100) * subm.loanFund;
        provision = (1 / 100) * subm.loanFund;
        notary = 1300000;
      } else if (subm.loanFund <= 100000000) {
        administrative = (2.75 / 100) * subm.loanFund;
        provision = (1 / 100) * subm.loanFund;
        notary = 1500000;
      } else if (subm.loanFund <= 150000000) {
        administrative = (2.3 / 100) * subm.loanFund;
        provision = (1 / 100) * subm.loanFund;
        notary = 1500000;
      } else if (subm.loanFund >= 150000000) {
        administrative = (1.95 / 100) * subm.loanFund;
        provision = (0.5 / 100) * subm.loanFund;
        notary = 1500000;
      }

      const payload = {
        realDate: new Date(),
        administrative,
        insurance,
        provision,
        mandatorySavings,
        notary,
        checkingFee,
        stampDuty,
      };

      await accRepository.create(subm.submId, type, payload);
    }
  }

  await submRepository.update(id, type, req.body);
  subm = await submRepository.getById(id, type);
  await notifRepository.create(
    subm.userId,
    new Date(),
    "Pengajuan",
    `Pengajuan produk ${subm.productName} tanggal ${subm.submDate.toLocaleString("ID-id", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })} telah ${subm.status.toLowerCase()} oleh Admin`
  );
  res.status(200).json(APISuccess("Sukses merubah pengajuan", { subm }));
}

async function cancelSubm(req, res) {
  const { id, type } = req.params;

  const subm = await submRepository.getById(id, type);
  if (!subm) throw new ReqError(errorCode.INVALID_SUBM, "Pengajuan tidak ditemukan", { flag: "id", type }, 404);

  if (subm.userId !== req.user.id) throw new ReqError(errorCode.INVALID_USER, "User tidak ditemukan", { flag: "id", type }, 404);

  await submRepository.deleteById(id, type);
  if (subm.status === "Ditinjau") {
    await notifRepository.create(
      subm.userId,
      new Date(),
      "Pengajuan",
      `Pengajuan produk ${subm.productName} tanggal ${subm.submDate.toLocaleString("ID-id", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })} berhasil dibatalkan`
    );
  }
  res.status(200).json(APISuccess("Sukses menghapus pengajuan", { subm }));
}

export default { create, get, getByUser, getSubmById, update, cancelSubm };
