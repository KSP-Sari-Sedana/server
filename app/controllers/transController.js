import transRepository from "../repositories/transRepository.js";
import errorCode from "../constants/errorCode.js";
import { ReqError } from "../helpers/appError.js";
import { APISuccess } from "../helpers/response.js";

async function create(req, res) {
  const { id, type } = req.params;
  if (type !== "saving" && type !== "loan") throw new ReqError(errorCode.INVALID_PRODUCT_TYPE, "Tipe produk tidak ditemukan", { flag: "type", type }, 404);

  if (req.user.role !== "Admin" && req.user.role !== "Teller") throw new ReqError(errorCode.INVALID_ROLE, "Role tidak ditemukan", { flag: "role", role: req.user.role }, 404);

  req.body.transDate = new Date();

  if (type === "saving") {
    if (req.body.code === "Setoran" || req.body.code === "Bunga") {
      req.body.debit = req.body.funds;
      req.body.credit = 0;
    } else if (req.body.code === "Penarikan" || req.body.code === "Administrasi") {
      req.body.debit = 0;
      req.body.credit = req.body.funds;
    }
  }

  if (type === "loan") {
    req.body.principal = req.body.principal || 0;
    req.body.interest = req.body.interest || 0;
    req.body.overdueFee = req.body.overdueFee || 0;
  }

  const trans = await transRepository.create(id, type, req.body);

  res.status(200).json(APISuccess("Transaksi berhasil dibuat", { trans }));
}

async function get(req, res) {
  const { limit } = req.query;

  if (req.user.role !== "Admin" && req.user.role !== "Teller") throw new ReqError(errorCode.INVALID_ROLE, "Role tidak ditemukan", { flag: "role", role: req.user.role }, 404);

  const trans = await transRepository.get(limit);

  res.status(200).json(APISuccess("Transaksi berhasil didapatkan", { trans }));
}

export default { create, get };
