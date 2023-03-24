import dbPool from "../../config/database.js";

async function findSavingBalance(id) {
  const query = `
    SELECT
      SUM(setoran) - SUM(penarikan) AS balance
    FROM angsuran_simpanan asi
    JOIN kitir_simpanan ksi ON asi.kitir_simpanan_id = ksi.id
    JOIN pengajuan_simpanan psi ON ksi.pengajuan_simpanan_id = psi.id
    WHERE psi.pengguna_id = ?
  `;

  const [rows] = await dbPool.execute(query, [id]);
  return rows[0];
}

async function findLoanTotal(id) {
  const query = `
    SELECT SUM(ppi.dana) AS loanTotal
    FROM pengajuan_pinjaman AS ppi
    WHERE ppi.pengguna_id = ? AND ppi.status = 'Diterima';
  `;

  const [rows] = await dbPool.execute(query, [id]);
  return rows[0];
}

async function findTotalLoanPayment(id) {
  const query = `
    SELECT
      SUM(api.pokok) AS totalLoanPayment
    FROM pengajuan_pinjaman ppi
    JOIN kitir_pinjaman kpi ON ppi.id = kpi.pengajuan_pinjaman_id
    JOIN angsuran_pinjaman api ON kpi.id = api.kitir_pinjaman_id
    WHERE ppi.pengguna_id = ?
  `;

  const [rows] = await dbPool.execute(query, [id]);
  return rows[0];
}

async function findTotalUser() {
  const query = `
    SELECT COUNT(*) AS totalUser
    FROM pengguna;
  `;
  const [result] = await dbPool.execute(query);
  return result[0];
}

async function findByUserRole(role) {
  const query = `
    SELECT COUNT(*) AS total${role}
    FROM pengguna
    WHERE role = ?;
  `;
  const [result] = await dbPool.execute(query, [role]);
  return result[0];
}

async function findByUserStatus(status) {
  const query = `
    SELECT COUNT(*) AS total${status}
    FROM pengguna
    WHERE status = ?;
  `;
  const [result] = await dbPool.execute(query, [status]);
  return result[0];
}

async function findTotalLoanBalance() {
  const query = `
    SELECT SUM(pokok) + SUM(bunga) + SUM(denda) AS totalLoanBalance FROM angsuran_pinjaman;
  `;
  const [result] = await dbPool.execute(query);
  return result[0];
}

async function findTotalSavingBalance() {
  const query = `
    SELECT SUM(setoran) AS totalSavingBalance FROM angsuran_simpanan
    WHERE sandi = 'Setoran' OR sandi = 'Bunga' OR sandi = 'Administrasi';
  `;
  const [result] = await dbPool.execute(query);
  return result[0];
}

async function findTotalTransaction(type, date) {
  let query = "";
  if (type === "saving") {
    query = `
      SELECT SUM(setoran) AS totalSavingTrans FROM angsuran_simpanan WHERE DATE(tanggal) = ?;
    `;
  } else if (type === "loan") {
    query = `
      SELECT SUM(pokok) + SUM(bunga) + SUM(denda) AS totalLoanTrans FROM angsuran_pinjaman WHERE DATE(tanggal) = ?;
    `;
  }

  const [result] = await dbPool.execute(query, [date]);
  return result[0];
}

export default { findSavingBalance, findLoanTotal, findTotalLoanPayment, findTotalUser, findByUserRole, findByUserStatus, findTotalLoanBalance, findTotalSavingBalance, findTotalTransaction };
