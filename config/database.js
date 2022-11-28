import mysql from "mysql2";
import("dotenv/config");

const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

const dbPool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

export default dbPool.promise();
