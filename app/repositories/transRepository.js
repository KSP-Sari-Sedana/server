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
      CONCAT(pengguna.nama_depan, ' ', pengguna.nama_belakang) AS name,
      pengguna.foto AS image,
      pengguna.role,
      kitir_pinjaman.nomor_rekening AS accNumber,
      angsuran_pinjaman.tanggal AS transDate,
      (angsuran_pinjaman.pokok + angsuran_pinjaman.bunga + angsuran_pinjaman.denda) AS total
    FROM kitir_pinjaman
      JOIN angsuran_pinjaman ON kitir_pinjaman.id = angsuran_pinjaman.kitir_pinjaman_id
      JOIN pengajuan_pinjaman ON kitir_pinjaman.pengajuan_pinjaman_id = pengajuan_pinjaman.id
      JOIN pengguna ON pengajuan_pinjaman.pengguna_id = pengguna.id

    UNION

    SELECT
      CONCAT(pengguna.nama_depan, ' ', pengguna.nama_belakang) AS name,
      pengguna.foto AS image,
      pengguna.role,
      kitir_simpanan.nomor_rekening AS accNumber,
      angsuran_simpanan.tanggal AS transDate,
      CASE
          WHEN angsuran_simpanan.sandi = 'Setoran' THEN angsuran_simpanan.setoran
          WHEN angsuran_simpanan.sandi = 'Penarikan' THEN angsuran_simpanan.penarikan
          WHEN angsuran_simpanan.sandi = 'Bunga' THEN angsuran_simpanan.setoran - angsuran_simpanan.penarikan
      ELSE 0
      END AS total
    FROM kitir_simpanan
      JOIN angsuran_simpanan ON kitir_simpanan.id = angsuran_simpanan.kitir_simpanan_id
      JOIN pengajuan_simpanan ON kitir_simpanan.pengajuan_simpanan_id = pengajuan_simpanan.id
      JOIN pengguna ON pengajuan_simpanan.pengguna_id = pengguna.id
    ORDER BY transDate DESC
    LIMIT ?;
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
