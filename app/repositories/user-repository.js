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
};
