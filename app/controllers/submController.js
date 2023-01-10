import submRepository from "../repositories/submRepository.js";
import userRepository from "../repositories/userRepository.js";
import errorCode from "../constants/errorCode.js";
import { APIError, ReqError } from "../helpers/appError.js";
import { APISuccess } from "../helpers/response.js";

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

  if (subm.userId !== user.id) throw new ReqError(errorCode.INVALID_SUBM, "Pengajuan tidak ditemukan", { flag: "id", type: req.params.type }, 404);

  res.status(200).json(APISuccess("Pengajuan berhasil didapatkan", { subm }));
}

export default { getByUser, getSubmById };
