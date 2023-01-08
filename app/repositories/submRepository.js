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

async function getById(id, type) {
  let result = {};
  let query = "";
  if (type === "saving") {
    query = `
      SELECT ps.id AS submId, 
        ps.produk_id AS productId, 
        ps.pengguna_id AS userId, 
        p.nama AS productName,
        p.tipe AS productType,
        p.setoran AS deposit,
        ps.angsuran AS installment, 
        ps.tenor, 
        ps.tanggal_pengajuan AS submDate, 
        ps.status AS status
      FROM pengajuan_simpanan AS ps
      JOIN produk AS p
      ON ps.produk_id = p.id
      WHERE ps.id = ?
    `;
    const [saving] = await dbPool.execute(query, [id]);
    result = saving[0];
  } else if (type === "loan") {
    query = `
      SELECT  pp.id AS submId, 
        pp.produk_id AS productId, 
        pp.pengguna_id AS userId, 
        p.nama AS productName,
        p.tipe AS productType,
        p.setoran AS deposit,
        pp.dana AS loanFund, 
        TRUNCATE(pp.bunga, 2) AS interest, 
        pp.tenor, 
        pp.tipe_bunga AS interestType, 
        pp.jaminan AS collateral, 
        pp.catatan AS note, 
        pp.tanggal_pengajuan AS submDate, 
        pp.status AS status
      FROM pengajuan_pinjaman AS pp 
      JOIN produk AS p 
      ON pp.produk_id = p.id 
      WHERE pp.pengguna_id = ?
    `;
    const [loan] = await dbPool.execute(query, [id]);
    result = loan[0];
  }

  return result;
}

export default { getByUser, getById };
