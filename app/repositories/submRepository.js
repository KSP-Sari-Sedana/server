import dbPool from "../../config/database.js";

async function getByUser(id) {
  let result = [];
  let query = `SELECT ps.id AS submId, ps.status AS status, ps.tanggal_pengajuan AS submDate, p.nama AS productName, p.tipe AS productType FROM pengajuan_simpanan AS ps JOIN produk AS p ON (ps.produk_id = p.id) WHERE ps.pengguna_id = ? ORDER BY ps.tanggal_pengajuan DESC`;
  const [saving] = await dbPool.execute(query, [id]);
  query = `SELECT pp.id AS submId, pp.status AS status, pp.tanggal_pengajuan AS submDate, p.nama AS productName, p.tipe AS productType FROM pengajuan_pinjaman AS pp JOIN produk AS p ON (pp.produk_id = p.id) WHERE pp.pengguna_id = ? ORDER BY pp.tanggal_pengajuan DESC`;
  const [loan] = await dbPool.execute(query, [id]);

  result = [...saving, ...loan];
  return result;
}

export default { getByUser };
