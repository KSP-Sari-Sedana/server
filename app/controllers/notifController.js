import userRepository from "../repositories/userRepository.js";
import notifRepository from "../repositories/notifRepository.js";
import { APISuccess } from "../helpers/response.js";

async function get(req, res) {
  const { username } = req.user;
  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  const notifications = await notifRepository.getById(user.id);
  res.status(200).json(APISuccess("Notifikasi berhasil didapatkan", { notifications }));
}

export default { get };
