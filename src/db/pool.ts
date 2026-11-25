import mysql from 'mysql2/promise';

export const DB_NAME = process.env.DB_NAME || 'p2b';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: DB_NAME,
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 8,
  queueLimit: 0,
  connectTimeout: 10000,
});
