import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'flappywars_db',
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Funció per verificar i establir la connexió
async function connectToDatabase() {
  try {
    const [result] = await pool.query('SELECT 1');
    console.log('✅ Connexió exitosa a flappywars_db');
    return true;
  } catch (error) {
    console.error('❌ Error connectant a la base de dades:', error.message);
    return false;
  }
}

export { connectToDatabase };