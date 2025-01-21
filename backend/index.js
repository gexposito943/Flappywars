import express from 'express';
import cors from 'cors';
import { pool, connectToDatabase } from './database.js';
import { logRequest } from './middlewares/logger.js';
import { registerUsers, loginUsers } from './controllers/loginController.js';

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

// Rutas de auth
app.post('/api/v1/register', registerUsers);
app.post('/api/v1/login', loginUsers);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
}); 
