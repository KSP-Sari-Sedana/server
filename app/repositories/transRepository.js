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

  return result;
}

export default { findTransById };
