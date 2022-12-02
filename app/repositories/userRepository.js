import dbPool from "../../config/database.js";

async function findAvailableCredential(columnName, value) {
  const query = `SELECT ${columnName} FROM pengguna WHERE ${columnName} = ? LIMIT 1`;
  const [result] = await dbPool.execute(query, [value]);
  if (result.length > 0) {
    return true;
  }
  return false;
}

async function create(username, namaDepan, namaBelakang, email, hashedPassword) {
  let query = `INSERT INTO pengguna(username, nama_depan, nama_belakang, email, password) VALUES(?, ?, ?, ?, ?)`;
  await dbPool.execute(query, [username, namaDepan, namaBelakang, email, hashedPassword]);

  query = `SELECT username, email, nama_depan as namaDepan, nama_belakang as namaBelakang FROM pengguna WHERE username = ? LIMIT 1`;
  const [result] = await dbPool.execute(query, [username]);
  return result[0];
}

export default { findAvailableCredential, create };
