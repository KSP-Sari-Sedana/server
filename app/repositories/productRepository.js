import dbPool from "../../config/database.js";

async function findAll() {
  const query = `SELECT nama, deskripsi, TRUNCATE(bunga, 2) AS bunga, status, tipe, jangka FROM produk`;
  const [result] = await dbPool.execute(query);
  return result;
}

export default { findAll };
