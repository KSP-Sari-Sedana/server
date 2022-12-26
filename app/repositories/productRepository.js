import dbPool from "../../config/database.js";

async function findAll() {
  const query = `SELECT id, nama AS name, foto AS image, deskripsi AS description, TRUNCATE(bunga, 2) AS interest, tipe AS type, setoran AS deposit, tenor, angsuran AS installment, status FROM produk WHERE status = 'aktif'`;
  const [result] = await dbPool.execute(query);
  return result;
}

async function findById(id) {
  const query = `SELECT id, nama AS name, foto AS image, deskripsi AS description, TRUNCATE(bunga, 2) AS interest, tipe AS type, setoran AS deposit, tenor, angsuran AS installment, status FROM produk WHERE id = ?`;
  const [result] = await dbPool.execute(query, [id]);
  return result[0];
}

async function create(namaProduk, fotoProduk, deskripsiProduk, bungaProduk, tipeProduk, setoranProduk, tenorProduk, angsuranProduk) {
  let query = `INSERT INTO produk(nama, foto, deskripsi, bunga, tipe, setoran, tenor, angsuran) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await dbPool.execute(query, [namaProduk, fotoProduk, deskripsiProduk, bungaProduk, tipeProduk, setoranProduk, tenorProduk, angsuranProduk]);
  return result;
}

export default { findAll, findById, create };
