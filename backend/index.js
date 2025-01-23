import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, connectToDatabase } from './database.js';
import { logRequest } from './middlewares/logger.js';
import routes from './routes/routes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logRequest);

const PORT = process.env.PORT || 3000;

// Inicialització de la base de dades
connectToDatabase().then(connected => {
  if (!connected) {
    console.error('No es va poder connectar a la base de dades. Tancant aplicació.');
    process.exit(1);
  }
});

// Ruta de prova per verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ message: 'Servidor funcionant correctament' });
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() as serverTime');
    res.json({ 
      message: 'Conexión exitosa a flappywars_db', 
      serverTime: rows[0].serverTime 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error conectando a la BD', 
      error: error.message 
    });
  }
});

app.use('/api/v1', routes);
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
}); 
