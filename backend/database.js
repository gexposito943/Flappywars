import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.pool = this.createPool();
    this.isConnected = false;
    // Iniciar connexió automàticament al crear la instància
    this.connect().catch(err => console.error('Error en connexió inicial:', err));
  }

  createPool() {
    return mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: 'flappywars_db',
      port: process.env.DB_PORT,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      dateStrings: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      // Afegit: configuració de timeout
      connectTimeout: 10000,
      acquireTimeout: 10000
    });
  }

  async checkTables() {
    const requiredTables = [
      'naus', 'usuaris', 'partides', 'nivells',
      'nivells_naus', 'obstacles', 'obstacles_partides',
      'partida_usuari_nau'
    ];

    const [tables] = await this.pool.query(`
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
    return true;
  }

  async checkDefaultData() {
    const [defaultShip] = await this.pool.query(
      "SELECT id FROM naus WHERE nom = 'X-Wing' AND punts_requerits = 0"
    );

    if (defaultShip.length === 0) {
      console.warn('⚠️ Falta la nau inicial X-Wing');
      return false;
    }

    const [defaultLevel] = await this.pool.query(
      "SELECT id FROM nivells WHERE punts_requerits = 0"
    );

    if (defaultLevel.length === 0) {
      console.warn('⚠️ Falta el nivell inicial');
      return false;
    }

    return true;
  }

  async connect() {
    if (this.isConnected) {
      return true;
    }

    try {
      await this.pool.query('SELECT 1');
      console.log('✅ Connexió exitosa a flappywars_db');

      const tablesOk = await this.checkTables();
      const defaultDataOk = await this.checkDefaultData();

      if (tablesOk && defaultDataOk) {
        console.log('✅ Estructura de base de dades correcta');
        this.isConnected = true;
        return true;
      }
      return false;

    } catch (error) {
      this.isConnected = false;
      console.error('❌ Error de connexió:', error.message);
      return false;
    }
  }

  // Mètode principal per executar consultes
  async query(sql, params = []) {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        // Assegurar que estem connectats abans de cada consulta
        if (!this.isConnected) {
          await this.connect();
        }
        const [result] = await this.pool.query(sql, params);
        return result;
      } catch (error) {
        retries++;
        console.error(`Error en consulta (intent ${retries}/${maxRetries}):`, error.message);

        if (this.isConnectionError(error)) {
          this.isConnected = false;
          await this.reconnect();
        }

        if (retries === maxRetries) throw error;
        
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      }
    }
  }

  // Mètode per transaccions
  async transaction(callback) {
    if (!this.isConnected) {
      await this.connect();
    }

    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      if (this.isConnectionError(error)) {
        this.isConnected = false;
      }
      throw error;
    } finally {
      connection.release();
    }
  }

  async reconnect() {
    console.log('🔄 Intentant reconnexió...');
    this.isConnected = false;
    
    try {
      await this.pool.end(); // Tancar el pool actual
    } catch (error) {
      console.error('Error al tancar el pool:', error.message);
    }

    this.pool = this.createPool();
    return this.connect();
  }

  isConnectionError(error) {
    const connectionErrors = [
      'PROTOCOL_CONNECTION_LOST',
      'ER_CON_COUNT_ERROR',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ECONNRESET'
    ];
    return connectionErrors.includes(error.code);
  }
}

// Crear instància única
const db = new Database();

// Exportar mètodes principals
export const query = (sql, params) => db.query(sql, params);
export const transaction = (callback) => db.transaction(callback);
export const connect = () => db.connect();

// Exportar la instància completa per casos especials
export default db;

