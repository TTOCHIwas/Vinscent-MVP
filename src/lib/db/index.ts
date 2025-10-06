import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// MySQL 연결 설정 
const connection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

export const db = drizzle(connection, { schema, mode: 'default' });