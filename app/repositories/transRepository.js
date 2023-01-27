import dbPool from "../../config/database.js";

async function create(accId, type, data) {
  let query = "";

  if (type === "saving") {
    query = `
      INSERT INTO angsuran_simpanan
        (kitir_simpanan_id, sandi, setoran, penarikan, tanggal)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [saving] = await dbPool.execute(query, [accId, data.code, data.debit, data.credit, data.transDate]);

    query = `
      SELECT 
        id,
        kitir_simpanan_id AS accId,
        sandi AS code,
        setoran AS debit,
        penarikan AS credit,
        tanggal AS transDate
      FROM angsuran_simpanan WHERE id = ?
    `;

    const [result] = await dbPool.execute(query, [saving.insertId]);
    return result[0];
  }

  if (type === "loan") {
    query = `
    INSERT INTO angsuran_pinjaman
    (kitir_pinjaman_id, pokok, bunga, denda, tanggal)
    VALUES (?, ?, ?, ?, ?)
    `;

    const [loan] = await dbPool.execute(query, [accId, data.principal, data.interest, data.overdueFee, data.transDate]);

    query = `
      SELECT
        id,
        kitir_pinjaman_id AS accId,
        pokok AS principal,
        bunga AS interest,
        denda AS overdueFee,
        tanggal AS transDate
      FROM angsuran_pinjaman WHERE id = ?
    `;

    const [result] = await dbPool.execute(query, [loan.insertId]);
    return result[0];
  }
}

async function get(limit) {
  const query = `
    SELECT
      pr.nama AS productName,
      CONCAT(pe.nama_depan, ' ', pe.nama_belakang) AS name,
      pe.foto AS image,
      pe.role,
      ksi.nomor_rekening AS accNumber,
      asi.tanggal AS transDate,
      SUM(asi.setoran + asi.penarikan) AS total
    FROM produk pr
    JOIN pengajuan_simpanan psi ON pr.id = psi.produk_id
    JOIN kitir_simpanan ksi ON psi.id = ksi.pengajuan_simpanan_id
    JOIN angsuran_simpanan asi ON ksi.id = asi.kitir_simpanan_id
    JOIN pengguna pe ON psi.pengguna_id = pe.id
    GROUP BY pr.nama, pe.nama_depan, pe.foto, pe.role, ksi.nomor_rekening, asi.tanggal

    UNION

    SELECT
      pr.nama AS produk,
      CONCAT(pe.nama_depan, ' ', pe.nama_belakang) AS name,
      pe.foto AS image,
      pe.role,
      kpi.nomor_rekening AS accNumber,
      api.tanggal AS transDate,
      SUM(api.pokok + api.bunga + api.denda) AS total
    FROM produk pr
    JOIN pengajuan_pinjaman ppi ON pr.id = ppi.produk_id
    JOIN kitir_pinjaman kpi ON ppi.id = kpi.pengajuan_pinjaman_id
    JOIN angsuran_pinjaman api ON kpi.id = api.kitir_pinjaman_id
    JOIN pengguna pe ON ppi.pengguna_id = pe.id
    GROUP BY pr.nama, pe.nama_depan, pe.foto, pe.role, kpi.nomor_rekening, api.tanggal
    ORDER BY transDate DESC LIMIT ?
  `;

  const [result] = await dbPool.execute(query, [limit]);
  return result;
}

async function findTransById(id, type) {
  let result = [];
  let query = "";

  if (type === "saving") {
    query = `
      SELECT
        asi.id,
        asi.tanggal AS date,
        asi.sandi AS code,
        asi.setoran AS debit,
        asi.penarikan AS credit
      FROM angsuran_simpanan AS asi
      JOIN kitir_simpanan AS ksi ON asi.kitir_simpanan_id = ksi.id
      JOIN pengajuan_simpanan AS ps ON ksi.pengajuan_simpanan_id = ps.id
      JOIN produk AS p ON ps.produk_id = p.id
      WHERE asi.kitir_simpanan_id = ?
      ORDER BY asi.tanggal ASC
    `;

    const [saving] = await dbPool.execute(query, [id]);
    result = [...saving];
  }

  if (type === "loan") {
    query = `
      SELECT
        api.id,
        api.tanggal AS date,
        api.pokok AS principal,
        api.bunga AS interest,
        api.denda AS penaltyFee
      FROM angsuran_pinjaman AS api
      JOIN kitir_pinjaman AS kpi ON api.kitir_pinjaman_id = kpi.id
      JOIN pengajuan_pinjaman AS ppi ON kpi.pengajuan_pinjaman_id = ppi.id
      JOIN produk AS p ON ppi.produk_id = p.id
      WHERE api.kitir_pinjaman_id = ?
      ORDER BY api.tanggal ASC
    `;

    const [loan] = await dbPool.execute(query, [id]);
    result = [...loan];
  }

  return result;
}

export default { create, get, findTransById };
