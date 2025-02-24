import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del pool de conexiones
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'flappywars_db',
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Noves opcions per a un millor maneig de dates i UUIDs
  timezone: 'Z',
  dateStrings: true
});

// Funció per verificar la connexió i la estructura de la base de dades
async function connectToDatabase() {
  try {
    // Verificar connexió bàsica
    const [result] = await pool.query('SELECT 1');
    console.log('✅ Connexió exitosa a flappywars_db');

    // Verificar taules principales
    const requiredTables = [
      'naus',
      'usuaris',
      'partides',
      'nivells',
      'nivells_naus',
      'obstacles',
      'obstacles_partides',
      'partida_usuari_nau'
    ];

    const [tables] = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'flappywars_db'
    `);

    const existingTables = tables.map(t => t.TABLE_NAME.toLowerCase());
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length > 0) {
      console.warn('⚠️ Taules que falten:', missingTables.join(', '));
      return false;
    }

    // Verificar dades bàsiques necessàries
    const [defaultShip] = await pool.query(
      "SELECT id FROM naus WHERE nom = 'X-Wing' AND punts_requerits = 0"
    );

    if (defaultShip.length === 0) {
      console.warn('⚠️ Falta la nau inicial X-Wing');
      return false;
    }

    const [defaultLevel] = await pool.query(
      "SELECT id FROM nivells WHERE punts_requerits = 0"
    );
    if (defaultLevel.length === 0) {
      console.warn('⚠️ Falta el nivell inicial');
      return false;
    }

    console.log('✅ Connexio a la base de dades correcte');
    return true;

  } catch (error) {
    console.error('❌ Error connectant a la base de dades:', error.message);
    return false;
  }
}

// Funció per executar queries dins d'una transacció
export async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export { connectToDatabase };