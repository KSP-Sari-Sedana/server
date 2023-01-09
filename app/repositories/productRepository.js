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

async function findConsumed(id, type) {
  let result = [];

  if (type === "saving") {
    let query = `
      SELECT
        ksi.id,
        ksi.nomor_rekening as accNumber,
        p.nama AS productName,
        COALESCE(SUM(asi.debet), 0) - COALESCE(SUM(asi.kredit), 0) as balance,
        ksi.tanggal_realisasi AS settleDate
      FROM pengajuan_simpanan AS psi
      JOIN kitir_simpanan AS ksi ON psi.id = ksi.pengajuan_simpanan_id
      LEFT JOIN angsuran_simpanan AS asi ON ksi.id = asi.kitir_simpanan_id
      JOIN produk AS p ON psi.produk_id = p.id
      WHERE psi.pengguna_id = ?
      GROUP BY psi.pengguna_id, ksi.id
    `;
    const [saving] = await dbPool.execute(query, [id]);
    result = [...saving];
  }

  return result;
}

export default { findAll, findById, create, findConsumed };
