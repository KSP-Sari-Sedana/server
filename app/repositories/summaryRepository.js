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
      SUM(api.pokok + api.bunga) AS totalLoanPayment
    FROM pengajuan_pinjaman ppi
    JOIN kitir_pinjaman kpi ON ppi.id = kpi.pengajuan_pinjaman_id
    JOIN angsuran_pinjaman api ON kpi.id = api.kitir_pinjaman_id
    WHERE ppi.pengguna_id = ?
  `;

  const [rows] = await dbPool.execute(query, [id]);
  return rows[0];
}

export default { findSavingBalance, findLoanTotal, findTotalLoanPayment };
