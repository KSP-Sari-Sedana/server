import dbPool from "../../config/database.js";

async function getById(id) {
  const query = `SELECT id, tanggal AS date, kategori AS category, detail, link, is_read AS isRead FROM notifikasi WHERE pengguna_id = ? ORDER BY tanggal DESC`;
  const [result] = await dbPool.execute(query, [id]);
  return result;
}

export default { getById };
