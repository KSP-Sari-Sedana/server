import dbPool from "../../config/database.js";

async function create(userId, date, category, detail) {
  const query = `
    INSERT INTO notifikasi (pengguna_id, tanggal, kategori, detail)
    VALUES (?, ?, ?, ?)
  `;

  const result = await dbPool.execute(query, [userId, date, category, detail]);
  const { affectedRows } = result[0];
  if (affectedRows === 1) return true;
  return false;
}

async function getByUser(id) {
  const query = `
    SELECT
      id,
      tanggal AS date,
      kategori AS category,
      detail,
      is_read AS isRead
    FROM notifikasi
    WHERE pengguna_id = ?
    ORDER BY tanggal DESC
  `;

  const [result] = await dbPool.execute(query, [id]);
  return result;
}

async function getById(id) {
  const query = `
    SELECT
      id,
      pengguna_id AS userId,
      tanggal AS date,
      kategori AS category,
      detail,
      is_read AS isRead
    FROM notifikasi
    WHERE id = ?
  `;

  const [result] = await dbPool.execute(query, [id]);
  return result[0];
}

async function markAsRead(id) {
  const query = `
    UPDATE notifikasi
    SET is_read = 1
    WHERE id = ?
  `;

  const result = await dbPool.execute(query, [id]);
  const { affectedRows } = result[0];
  if (affectedRows === 1) return true;
  return false;
}

export default { create, getByUser, getById, markAsRead };
