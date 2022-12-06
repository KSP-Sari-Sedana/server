import dbPool from "../../config/database.js";

async function findAll() {
  const query = `SELECT nama, foto, deskripsi, TRUNCATE(bunga, 2) AS bunga, tipe, setoran, tenor, angsuran, status FROM produk WHERE status = 'aktif'`;
  const [result] = await dbPool.execute(query);
  return result;
}

export default { findAll };
