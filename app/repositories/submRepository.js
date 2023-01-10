import dbPool from "../../config/database.js";

async function findAll(type) {
  let query = "";

  if (type === "saving") {
    query = `
      SELECT
        psi.id AS submId,
        pe.id AS userId,
        CONCAT(pe.nama_depan, ' ', pe.nama_belakang) AS fullName,
        pe.email,
        pe.role,
        pe.foto AS image,
        pr.nama AS productName,
        pr.setoran AS deposit,
        psi.tanggal_pengajuan AS submDate,
        psi.angsuran AS installment,
        psi.tenor,
        psi.status AS status
      FROM pengajuan_simpanan AS psi
      JOIN pengguna AS pe ON psi.pengguna_id = pe.id
      JOIN produk AS pr ON (psi.produk_id = pr.id)
      ORDER BY psi.tanggal_pengajuan DESC
    `;

    const [saving] = await dbPool.execute(query);
    return saving;
  }

  if (type === "loan") {
    query = `
      SELECT
        ppi.id AS submId,
        pe.id AS userId,
        CONCAT(pe.nama_depan, ' ', pe.nama_belakang) AS fullName,
        pe.email,
        pe.role,
        pe.foto AS image,
        pr.nama AS productName,
        ppi.tipe_bunga AS interestType,
        ppi.tanggal_pengajuan AS submDate,
        ppi.dana AS loanFund,
        ppi.tenor,
        ppi.jaminan AS collateral,
        ppi.status AS status
      FROM pengajuan_pinjaman AS ppi
      JOIN pengguna AS pe ON ppi.pengguna_id = pe.id
      JOIN produk AS pr ON (ppi.produk_id = pr.id)
      ORDER BY ppi.tanggal_pengajuan DESC
    `;

    const [loan] = await dbPool.execute(query);
    return loan;
  }
}

async function getByUser(id) {
  let result = [];
  let query = `
    SELECT
      ps.id AS submId,
      ps.status AS status,
      ps.tanggal_pengajuan AS submDate,
      p.nama AS productName,
      p.tipe AS productType
    FROM pengajuan_simpanan AS ps
    JOIN produk AS p ON (ps.produk_id = p.id)
    WHERE ps.pengguna_id = ? 
    ORDER BY ps.tanggal_pengajuan DESC
  `;

  const [saving] = await dbPool.execute(query, [id]);

  query = `
    SELECT
      pp.id AS submId,
      pp.status AS status,
      pp.tanggal_pengajuan AS submDate,
      p.nama AS productName,
      p.tipe AS productType
    FROM pengajuan_pinjaman AS pp
    JOIN produk AS p ON (pp.produk_id = p.id)
    WHERE pp.pengguna_id = ?
    ORDER BY pp.tanggal_pengajuan DESC
  `;

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
      WHERE pp.id = ?
    `;

    const [loan] = await dbPool.execute(query, [id]);
    result = loan[0];
  }

  return result;
}

export default { findAll, getByUser, getById };
