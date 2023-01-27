import transRepository from "../repositories/transRepository.js";
import accRepository from "../repositories/accRepository.js";
import notifRepository from "../repositories/notifRepository.js";
import errorCode from "../constants/errorCode.js";
import format from "../helpers/formatter.js";
import { ReqError } from "../helpers/appError.js";
import { APISuccess } from "../helpers/response.js";

async function create(req, res) {
  const { id, type } = req.params;

  if (type !== "saving" && type !== "loan") throw new ReqError(errorCode.INVALID_PRODUCT_TYPE, "Tipe produk tidak ditemukan", { flag: "type", type }, 404);
  if (req.user.role !== "Admin" && req.user.role !== "Teller") throw new ReqError(errorCode.INVALID_ROLE, "Role tidak ditemukan", { flag: "role", role: req.user.role }, 404);

  const acc = await accRepository.getById(id, type);
  if (!acc) throw new ReqError(errorCode.INVALID_ACCOUNT, "Akun tidak ditemukan", { flag: "id", id }, 404);

  req.body.transDate = new Date();

  if (type === "saving") {
    if (req.body.code === "Setoran" || req.body.code === "Bunga") {
      req.body.debit = req.body.funds;
      req.body.credit = 0;
    } else if (req.body.code === "Penarikan" || req.body.code === "Administrasi") {
      req.body.debit = 0;
      req.body.credit = req.body.funds;
    }
  } else if (type === "loan") {
    req.body.principal = req.body.principal || 0;
    req.body.interest = req.body.interest || 0;
    req.body.overdueFee = req.body.overdueFee || 0;
  }

  const trans = await transRepository.create(id, type, req.body);
  const total = trans?.debit || 0 + trans?.credit || 0 + trans?.debit || 0 + trans?.principal || 0 + trans?.interest || 0 + trans?.overdueFee || 0;
  await notifRepository.create(acc.userId, new Date(), "Transaksi", `Transaksi dilakukan pada rekening ${format.accNumber(acc.accNumber)} sebesar Rp ${total.toLocaleString("ID-id")}`);
  res.status(200).json(APISuccess("Transaksi berhasil dibuat", { trans }));
}

async function get(req, res) {
  const { limit } = req.query;

  if (req.user.role !== "Admin" && req.user.role !== "Teller") throw new ReqError(errorCode.INVALID_ROLE, "Role tidak ditemukan", { flag: "role", role: req.user.role }, 404);

  const trans = await transRepository.get(limit);

  res.status(200).json(APISuccess("Transaksi berhasil didapatkan", { trans }));
}

export default { create, get };
