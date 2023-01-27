import dbPool from "../../config/database.js";

async function getById(id, type) {
  let query = "";
  if (type === "saving") {
    query = `
      SELECT
        ksi.id AS accId,
        ksi.pengajuan_simpanan_id AS submId,
        psi.pengguna_id AS userId,
        ksi.nomor_rekening AS accNumber,
        ksi.tanggal_realisasi AS realDate,
        ksi.status
      FROM kitir_simpanan AS ksi
      JOIN pengajuan_simpanan psi on psi.id = ksi.pengajuan_simpanan_id
      WHERE ksi.id = ?
    `;
  } else if (type === "loan") {
    query = `
      SELECT
        kpi.id AS accId,
        kpi.pengajuan_pinjaman_id AS submId,
        ppi.pengguna_id AS userId,
        kpi.nomor_rekening AS accNumber,
        kpi.tanggal_realisasi AS realDate,
        kpi.status
      FROM kitir_pinjaman AS kpi
      JOIN pengajuan_pinjaman ppi on ppi.id = kpi.pengajuan_pinjaman_id
      WHERE kpi.id = ?
    `;
  }

  const [result] = await dbPool.execute(query, [id]);
  return result[0];
}

async function create(id, type, payload) {
  let query = "";

  if (type === "saving") {
    query = `
      INSERT INTO
        kitir_simpanan(pengajuan_simpanan_id, status, tanggal_realisasi)
      VALUES(?, ?, ?)
    `;

    const result = await dbPool.execute(query, [id, payload.status || "Berjalan", payload.realDate]);
    const saving = await getById(result[0].insertId, "saving");
    return saving;
  }

  if (type === "loan") {
    query = `
      INSERT INTO
        kitir_pinjaman(pengajuan_pinjaman_id, administrasi, asuransi, provisi, simpanan_wajib, notaris, biaya_pengecekan, materai, status, tanggal_realisasi)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      payload.status || "Berjalan",
      payload.realDate,
    ]);
    const loan = await getById(result[0].insertId, "loan");
    return loan;
  }
}

async function setStatus(id, type, status) {
  let query = "";
  let result = undefined;
  if (type === "saving") {
    query = `
      UPDATE kitir_simpanan
      SET status = ?
      WHERE id = ?
    `;
  } else if (type === "loan") {
    query = `
      UPDATE kitir_pinjaman
      SET status = ?
      WHERE id = ?
    `;
  }
  result = await dbPool.execute(query, [status, id]);
  return result[0];
}

export default { getById, create, setStatus };
