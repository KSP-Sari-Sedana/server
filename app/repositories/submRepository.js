import dbPool from "../../config/database.js";

async function create(userId, type, subm) {
  let query = "";

  if (type === "saving") {
    query = `
      INSERT INTO
        pengajuan_simpanan(produk_id, pengguna_id, angsuran, tenor, tanggal_pengajuan, status)
      VALUES(?, ?, ?, ?, ?, ?)
    `;

    const result = await dbPool.execute(query, [subm.productId, userId, subm.installment, subm.tenor, subm.submDate, subm.status || "Ditinjau"]);

    query = `
      SELECT
        psi.id AS submId,
        psi.produk_id AS productId,
        psi.pengguna_id AS userId,
        pe.username,
        pr.nama AS productName,
        pr.tipe AS productType,
        pr.setoran AS deposit,
        psi.angsuran AS installment,
        psi.tenor,
        psi.tanggal_pengajuan AS submDate,
        psi.status AS status
      FROM pengajuan_simpanan AS psi
      JOIN pengguna AS pe on psi.pengguna_id = pe.id
      JOIN produk AS pr ON psi.produk_id = pr.id
      WHERE psi.id = ?
    `;

    const [saving] = await dbPool.execute(query, [result[0].insertId]);
    return saving[0];
  } else if (type === "loan") {
    query = `
      INSERT INTO
        pengajuan_pinjaman(produk_id, pengguna_id, dana, bunga, tenor, tipe_bunga, jaminan, catatan, tanggal_pengajuan, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await dbPool.execute(query, [
      subm.productId,
      userId,
      subm.loanFund,
      subm.interest,
      subm.tenor,
      subm.interestType,
      subm.collateral,
      subm.note,
      subm.submDate,
      subm.status || "Ditinjau",
    ]);

    query = `
      SELECT
        ppi.id AS submId,
        ppi.produk_id AS productId,
        ppi.pengguna_id AS userId,
        pe.username,
        pr.nama AS productName,
        pr.tipe AS productType,
        pr.setoran AS deposit,
        ppi.dana AS loanFund,
        TRUNCATE(ppi.bunga, 2) AS interest,
        ppi.tenor,
        ppi.tipe_bunga AS interestType,
        ppi.jaminan AS collateral,
        ppi.catatan AS note,
        ppi.tanggal_pengajuan AS submDate,
        ppi.status AS status
      FROM pengajuan_pinjaman AS ppi
      JOIN pengguna pe on ppi.pengguna_id = pe.id
      JOIN produk AS pr ON ppi.produk_id = pr.id
      WHERE ppi.id = ?
    `;

    const [loan] = await dbPool.execute(query, [result[0].insertId]);
    return loan[0];
  }
}

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
      SELECT
        psi.id AS submId,
        psi.produk_id AS productId,
        psi.pengguna_id AS userId,
        pe.username,
        pe.nama_depan AS firstName,
        pe.nama_belakang AS lastName,
        pe.role,
        pe.email,
        pe.foto AS image,
        pe.telepon AS cellphone,
        pe.status AS userStatus,
        pr.nama AS productName,
        pr.tipe AS productType,
        pr.setoran AS deposit,
        psi.angsuran AS installment,
        psi.tenor,
        psi.tanggal_pengajuan AS submDate,
        psi.status AS status
      FROM pengajuan_simpanan AS psi
      JOIN pengguna AS pe on psi.pengguna_id = pe.id
      JOIN produk AS pr ON psi.produk_id = pr.id
      WHERE psi.id = ?
    `;

    const [saving] = await dbPool.execute(query, [id]);
    result = saving[0];
  } else if (type === "loan") {
    query = `
      SELECT
        ppi.id AS submId,
        ppi.produk_id AS productId,
        ppi.pengguna_id AS userId,
        pe.username,
        pe.nama_depan AS firstName,
        pe.nama_belakang AS lastName,
        pe.role,
        pe.email,
        pe.foto AS image,
        pe.telepon AS cellphone,
        pe.status AS userStatus,
        pr.nama AS productName,
        pr.tipe AS productType,
        pr.setoran AS deposit,
        ppi.dana AS loanFund,
        TRUNCATE(ppi.bunga, 2) AS interest,
        ppi.tenor,
        ppi.tipe_bunga AS interestType,
        ppi.jaminan AS collateral,
        ppi.catatan AS note,
        ppi.tanggal_pengajuan AS submDate,
        ppi.status AS status
      FROM pengajuan_pinjaman AS ppi
      JOIN pengguna pe on ppi.pengguna_id = pe.id
      JOIN produk AS pr ON ppi.produk_id = pr.id
      WHERE ppi.id = ?
    `;

    const [loan] = await dbPool.execute(query, [id]);
    result = loan[0];
  }

  return result;
}

async function deleteById(id, type) {
  let query = "";
  let result = undefined;

  if (type === "saving") {
    query = `
      DELETE
      FROM pengajuan_simpanan
      WHERE id = ?
    `;
  } else if (type === "loan") {
    query = `
      DELETE
      FROM pengajuan_pinjaman
      WHERE id = ?
    `;
  }
  result = await dbPool.execute(query, [id]);
  return result;
}

async function update(id, type, payload) {
  let query = "";
  let result = undefined;

  if (type === "saving") {
    query = `
      UPDATE pengajuan_simpanan
      SET status = ?
      WHERE id = ?
    `;
  }

  if (type === "loan") {
    query = `
      UPDATE pengajuan_pinjaman
      SET status = ?
      WHERE id = ?
    `;
  }

  result = await dbPool.execute(query, [payload.status, id]);
  return result;
}

export default { create, findAll, getByUser, getById, deleteById, update };
