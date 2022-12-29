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
  const query = `SELECT id, username, email, foto AS image, nama_depan AS firstName, nama_belakang AS lastName, telepon AS cellphone, provinsi AS province, kabupaten AS district, kecamatan AS subdistrict, alamat AS address, nip AS nin, pekerjaan AS job, gaji AS salary, pengeluaran AS expense, role, status, password FROM pengguna WHERE ${columnName} = ? LIMIT 1`;
  const [result] = await dbPool.execute(query, [value]);
  return result[0];
}

async function create(username, namaDepan, namaBelakang, email, hashedPassword) {
  let query = `INSERT INTO pengguna(username, nama_depan, nama_belakang, email, password) VALUES(?, ?, ?, ?, ?)`;
  await dbPool.execute(query, [username, namaDepan, namaBelakang, email, hashedPassword]);

  query = `SELECT id, username, email, nama_depan AS firstName, nama_belakang AS lastName FROM pengguna WHERE username = ? LIMIT 1`;
  const [result] = await dbPool.execute(query, [username]);
  return result[0];
}

export default { findAvailableCredential, findByCredential, create };
