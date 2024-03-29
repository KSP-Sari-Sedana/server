import { APIError } from "../helpers/appError.js";
import errorCode from "../constants/errorCode.js";
import { APISuccess } from "../helpers/response.js";
import accRepository from "../repositories/accRepository.js";

async function setStatus(req, res) {
  if (req.user.role !== "Admin") throw new APIError(errorCode.RESOURCE_FORBIDDEN, "Akses mengubah status kitir ditolak", 403);

  const { type, id } = req.params;
  const { status } = req.body;

  if (type !== "saving" && type !== "loan") throw new APIError(errorCode.RESOURCE_NOT_FOUND, "Tipe produk tidak ditemukan", 404);
  if (status !== "Berjalan" && status !== "Selesai") throw new APIError(errorCode.RESOURCE_NOT_FOUND, "Status harus berjalan atau selesai", 404);

  const account = await accRepository.getById(id, type);
  if (!account) throw new APIError(errorCode.RESOURCE_NOT_FOUND, "Kitir tidak ditemukan", 404);

  let result = undefined;
  if (type === "saving") {
    result = await accRepository.setStatus(id, type, status);
  } else if (type === "loan") {
    result = await accRepository.setStatus(id, type, status);
  }
  if (!result) throw new APIError(errorCode.RESOURCE_NOT_FOUND, "Kitir tidak ditemukan", 404);

  const acc = await accRepository.getById(id, type);
  res.status(200).json(APISuccess("Sukses mengubah status kitir", { acc }));
}

export default { setStatus };
