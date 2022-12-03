import dbPool from "../../config/database.js";

async function findAvailableCredential(columnName, value) {
  const query = `SELECT ${columnName} FROM pengguna WHERE ${columnName} = ? LIMIT 1`;
  const [result] = await dbPool.execute(query, [value]);
  if (result.length > 0) {
    return true;
  }
  return false;
}

async function findByCredential(columnName, value) {
  const query = `SELECT username, email, nama_depan AS namaDepan, nama_belakang AS namaBelakang, telepon, provinsi, kabupaten, kecamatan, alamat, nip, foto_ktp AS fotoKTP, pekerjaan, gaji, pengeluaran, pembayaran, role, status, password FROM pengguna WHERE ${columnName} = ? LIMIT 1`;
  const [result] = await dbPool.execute(query, [value]);
  return result[0];
}

async function create(username, namaDepan, namaBelakang, email, hashedPassword) {
  let query = `INSERT INTO pengguna(username, nama_depan, nama_belakang, email, password) VALUES(?, ?, ?, ?, ?)`;
  await dbPool.execute(query, [username, namaDepan, namaBelakang, email, hashedPassword]);

  query = `SELECT username, email, nama_depan AS namaDepan, nama_belakang AS namaBelakang FROM pengguna WHERE username = ? LIMIT 1`;
  const [result] = await dbPool.execute(query, [username]);
  return result[0];
}

export default { findAvailableCredential, findByCredential, create };
