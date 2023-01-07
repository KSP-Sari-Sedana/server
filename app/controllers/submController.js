import submRepository from "../repositories/submRepository.js";
import userRepository from "../repositories/userRepository.js";
import errorCode from "../constants/errorCode.js";
import { APIError } from "../helpers/appError.js";
import { APISuccess } from "../helpers/response.js";

async function get(req, res) {
  const { username } = req.user;
  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  const subm = await submRepository.getByUser(user.id);

  subm.sort((a, b) => {
    return new Date(a.submDate) - new Date(b.submDate);
  });

  res.status(200).json(APISuccess("Pengajuan berhasil didapatkan", { subm }));
}

export default { get };
