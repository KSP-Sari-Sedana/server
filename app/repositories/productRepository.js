import dbPool from "../../config/database.js";

async function findAll() {
  const query = `SELECT nama, foto, deskripsi, TRUNCATE(bunga, 2) AS bunga, tipe, setoran, tenor, angsuran, status FROM produk WHERE status = 'aktif'`;
  const [result] = await dbPool.execute(query);
  return result;
}

async function findById(id) {
  const query = `SELECT nama, foto, deskripsi, TRUNCATE(bunga, 2) AS bunga, status, tipe, setoran, tenor, angsuran FROM produk WHERE id = ?`;
  const [result] = await dbPool.execute(query, [id]);
  return result;
}

export default { findAll, findById };
