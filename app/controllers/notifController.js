import userRepository from "../repositories/userRepository.js";
import notifRepository from "../repositories/notifRepository.js";
import errorCode from "../constants/errorCode.js";
import { APIError } from "../helpers/appError.js";
import { APISuccess } from "../helpers/response.js";

async function get(req, res) {
  const { username } = req.user;
  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  const notifications = await notifRepository.getByUser(user.id);
  res.status(200).json(APISuccess("Notifikasi berhasil didapatkan", { notifications }));
}

async function markRead(req, res) {
  const { id } = req.params;
  const { username } = req.user;
  const user = await userRepository.findByCredential("username", username);
  if (!user) throw new APIError(errorCode.INVALID_USER, "User tidak ditemukan", 404);

  const notification = await notifRepository.getById(id);
  if (!notification) throw new APIError(errorCode.INVALID_NOTIF, "Notifikasi tidak ditemukan", 404);

  if (user.id !== notification.userId) throw new APIError(errorCode.INVALID_NOTIF, "Notifikasi tidak ditemukan", 404);

  await notifRepository.markAsRead(id);
  res.status(200).json(APISuccess("Notifikasi berhasil ditandai telah dibaca", null));
}

export default { get, markRead };
