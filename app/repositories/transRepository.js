import dbPool from "../../config/database.js";

async function findTransById(id, type) {
  let result = [];
  let query = "";

  if (type === "saving") {
    query = `
      SELECT
        asi.id,
        asi.tanggal AS date,
        asi.sandi AS code,
        asi.debet AS debit,
        asi.kredit AS credit
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

export default { findTransById };
