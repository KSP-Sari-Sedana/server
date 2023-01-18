import dbPool from "../../config/database.js";

async function findAll() {
  const query = `
    SELECT
      id,
      nama AS name,
      foto AS image,
      deskripsi AS description,
      TRUNCATE(bunga, 2) AS interest,
      tipe AS type,
      setoran AS deposit, tenor,
      angsuran AS installment,
      status
    FROM produk
  `;

  const [result] = await dbPool.execute(query);
  return result;
}

async function findByStatus(status) {
  const query = `
    SELECT
      id,
      nama AS name,
      foto AS image,
      deskripsi AS description,
      TRUNCATE(bunga, 2) AS interest,
      tipe AS type,
      setoran AS deposit, tenor,
      angsuran AS installment,
      status
    FROM produk
    WHERE status = ?
  `;

  const [result] = await dbPool.execute(query, [status]);
  return result;
}

async function findById(id) {
  const query = `
    SELECT
      id,
      nama AS name,
      foto AS image,
      deskripsi AS description,
      TRUNCATE(bunga, 2) AS interest,
      tipe AS type,
      setoran AS deposit,
      tenor,
      angsuran AS installment,
      status
    FROM produk WHERE id = ?
  `;

  const [result] = await dbPool.execute(query, [id]);
  return result[0];
}

async function create(name, image, description, interest, type, deposit, tenor, installment, status) {
  let query = "";
  let result = undefined;

  if (image !== "null") {
    query = `
      INSERT INTO produk(nama, foto, deskripsi, bunga, tipe, setoran, tenor, angsuran, status)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    [result] = await dbPool.execute(query, [name, image, description, interest, type, deposit, tenor, installment, status]);
  } else {
    query = `
      INSERT INTO produk(nama, deskripsi, bunga, tipe, setoran, tenor, angsuran, status)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
    `;
    [result] = await dbPool.execute(query, [name, description, interest, type, deposit, tenor, installment, status]);
  }

  return result;
}

async function update(id, name, image, description, interest, type, deposit, tenor, installment, status) {
  let query = "";
  let result = undefined;

  if (image !== "null") {
    query = `
      UPDATE produk
      SET
        nama = ?,
        foto = ?,
        deskripsi = ?,
        bunga = ?,
        tipe = ?,
        setoran = ?,
        tenor = ?,
        angsuran = ?,
        status = ?
      WHERE id = ?;
    `;
    result = await dbPool.execute(query, [name, image, description, interest, type, deposit, tenor, installment, status, id]);
  } else {
    query = `
      UPDATE produk
      SET nama = ?,
        deskripsi = ?,
        bunga = ?,
        tipe = ?,
        setoran = ?,
        tenor = ?,
        angsuran = ?,
        status = ?
      WHERE id = ?;
    `;
    result = await dbPool.execute(query, [name, description, interest, type, deposit, tenor, installment, status, id]);
  }

  return result;
}

async function findConsumed(id, type) {
  let result = [];
  let query = "";

  if (type === "saving") {
    query = `
      SELECT
        ksi.id AS submId,
        ksi.id AS accId,
        ksi.nomor_rekening AS accNumber,
        p.nama AS productName,
        p.tipe AS productType,
        COALESCE(SUM(asi.setoran), 0) - COALESCE(SUM(asi.penarikan), 0) AS balance,
        ksi.tanggal_realisasi AS settleDate,
        ksi.status
      FROM pengajuan_simpanan AS psi
      JOIN kitir_simpanan AS ksi ON psi.id = ksi.pengajuan_simpanan_id
      LEFT JOIN angsuran_simpanan AS asi ON ksi.id = asi.kitir_simpanan_id
      JOIN produk AS p ON psi.produk_id = p.id
      WHERE psi.pengguna_id = ?
      GROUP BY psi.pengguna_id, ksi.id
    `;

    const [saving] = await dbPool.execute(query, [id]);
    result = [...saving];
  }

  if (type === "loan") {
    query = `
      SELECT
        kpi.id AS submId,
        kpi.id AS accId,
        kpi.nomor_rekening AS accNumber,
        p.nama AS productName,
        p.tipe AS productType,
        ppi.dana - COALESCE(SUM(api.bunga + api.pokok), 0) AS loanBalance,
        kpi.tanggal_realisasi AS settleDate,
        kpi.status
      FROM pengajuan_pinjaman AS ppi
      JOIN kitir_pinjaman AS kpi ON ppi.id = kpi.pengajuan_pinjaman_id
      LEFT JOIN angsuran_pinjaman AS api ON kpi.id = api.kitir_pinjaman_id
      JOIN produk AS p ON ppi.produk_id = p.id
      WHERE ppi.pengguna_id = ?
      GROUP BY ppi.pengguna_id, kpi.id
    `;

    const [loan] = await dbPool.execute(query, [id]);
    result = [...loan];
  }

  return result;
}

async function findConsumedById(id, type) {
  let result = {};
  let query = "";

  if (type === "saving") {
    query = `
      SELECT
        ksi.id,
        psi.pengguna_id AS userId,
        ksi.nomor_rekening AS accNumber,
        p.nama AS productName,
        p.tipe AS productType,
        COALESCE(SUM(asi.setoran), 0) - COALESCE(SUM(asi.penarikan), 0) AS balance,
        ksi.tanggal_realisasi AS settleDate
      FROM pengajuan_simpanan AS psi
      JOIN kitir_simpanan AS ksi ON psi.id = ksi.pengajuan_simpanan_id
      LEFT JOIN angsuran_simpanan AS asi ON ksi.id = asi.kitir_simpanan_id
      JOIN produk AS p ON psi.produk_id = p.id
      WHERE ksi.id = ?
      GROUP BY psi.pengguna_id, ksi.id
    `;

    const [saving] = await dbPool.execute(query, [id]);
    result = saving[0];
  }

  if (type === "loan") {
    query = `
      SELECT
        kpi.id,
        ppi.pengguna_id AS userId,
        CONCAT(pe.nama_depan, ' ', pe.nama_belakang) AS fullName,
        CONCAT(pe.kecamatan, ', ', pe.kabupaten) AS address,
        pe.telepon AS cellphone,
        ppi.tipe_bunga AS interestType,
        ppi.tenor,
        kpi.administrasi AS administrative,
        kpi.provisi AS provision,
        kpi.simpanan_wajib AS mandatorySavings,
        kpi.nomor_rekening AS accNumber,
        pr.nama AS productName,
        pr.tipe AS productType,
        ppi.dana AS loanFund,
        COALESCE(SUM(api.bunga + api.pokok), 0) AS totalPayment,
        ppi.dana - COALESCE(SUM(api.bunga + api.pokok), 0) AS loanBalance,
        COALESCE(SUM(api.denda), 0) AS penaltyTotal,
        kpi.tanggal_realisasi AS settleDate
      FROM pengajuan_pinjaman AS ppi
      JOIN pengguna AS pe ON ppi.pengguna_id = pe.id
      JOIN kitir_pinjaman AS kpi ON ppi.id = kpi.pengajuan_pinjaman_id
      LEFT JOIN angsuran_pinjaman AS api ON kpi.id = api.kitir_pinjaman_id
      JOIN produk AS pr ON ppi.produk_id = pr.id
      WHERE kpi.id = ?
      GROUP BY ppi.pengguna_id, kpi.id
    `;

    const [loan] = await dbPool.execute(query, [id]);
    result = loan[0];
  }

  return result;
}

export default { findAll, findByStatus, findById, create, update, findConsumed, findConsumedById };
