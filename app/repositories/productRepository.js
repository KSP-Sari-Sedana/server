import dbPool from "../../config/database.js";

async function findAll() {
  const query = `SELECT id, nama, foto, deskripsi, TRUNCATE(bunga, 2) AS bunga, tipe, setoran, tenor, angsuran, status FROM produk WHERE status = 'aktif'`;
  const [result] = await dbPool.execute(query);
  return result;
}

async function findById(id) {
  const query = `SELECT id, nama, foto, deskripsi, TRUNCATE(bunga, 2) AS bunga, status, tipe, setoran, tenor, angsuran FROM produk WHERE id = ?`;
  const [result] = await dbPool.execute(query, [id]);
  return result[0];
}

async function create(namaProduk, fotoProduk, deskripsiProduk, bungaProduk, tipeProduk, setoranProduk, tenorProduk, angsuranProduk) {
  let query = `INSERT INTO produk(nama, foto, deskripsi, bunga, tipe, setoran, tenor, angsuran) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await dbPool.execute(query, [namaProduk, fotoProduk, deskripsiProduk, bungaProduk, tipeProduk, setoranProduk, tenorProduk, angsuranProduk]);
  return result;
}

export default { findAll, findById, create };
