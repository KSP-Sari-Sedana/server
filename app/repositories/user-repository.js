const { db } = require("../../config/mysql");
const response = require("../helpers/response");

module.exports = {
  findByCredential(columnName, value) {
    return new Promise((resolve, reject) => {
      const query = `SELECT ${columnName} FROM pengguna WHERE ${columnName} = ? LIMIT 1`;
      db.query(query, [value], (err, result) => {
        if (err) {
          reject(response.error(500, { message: err.message }));
        } else if (result.length > 0) resolve(true);
        else resolve(false);
      });
    });
  },

  create(username, namaDepan, namaBelakang, email, password) {
    return new Promise((resolve, reject) => {
      let query = `INSERT INTO pengguna(username, nama_depan, nama_belakang, email, password) VALUES(?, ?, ?, ?, ?)`;
      db.query(query, [username, namaDepan, namaBelakang, email, password], (err) => {
        if (err) reject(response.error(422, { message: `registrasi gagal` }));
      });

      query = `SELECT username, email, nama_depan as namaDepan, nama_belakang as namaBelakang FROM pengguna WHERE username = ? LIMIT 1`;
      db.query(query, [username], (err, result) => {
        if (err) reject(response.error(422, { message: `registrasi gagal` }));
        resolve(result[0]);
      });
    });
  },
};
