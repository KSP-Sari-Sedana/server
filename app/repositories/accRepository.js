import dbPool from "../../config/database.js";

async function create(id, type, payload) {
  let query = "";

  if (type === "saving") {
    query = `
      INSERT INTO
        kitir_simpanan(pengajuan_simpanan_id, tanggal_realisasi)
      VALUES(?, ?)
    `;

    const result = await dbPool.execute(query, [id, payload.realDate]);
    return result[0];
  }

  if (type === "loan") {
    query = `
      INSERT INTO
        kitir_pinjaman(pengajuan_pinjaman_id, administrasi, asuransi, provisi, simpanan_wajib, notaris, biaya_pengecekan, materai, tanggal_realisasi)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbPool.execute(query, [
      id,
      payload.administrative,
      payload.insurance,
      payload.provision,
      payload.mandatorySavings,
      payload.notary,
      payload.checkingFee,
      payload.stampDuty,
      payload.realDate,
    ]);
    return result[0];
  }
}

export default { create };
