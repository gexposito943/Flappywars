import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, connectToDatabase } from './database.js';
import { logRequest } from './middlewares/logger.js';
import routes from './routes/routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(logRequest);

// Configuración de rutas estáticas
const ASSETS_PATH = path.join(__dirname, 'public/assets');
app.use('/public/assets', express.static(ASSETS_PATH));

// Rutas de assets organizadas por tipo
const assetRoutes = {
  naus: '/public/assets/images/naus',
  nivells: '/public/assets/images/nivells',
  obstacles: '/public/assets/images/obstacles'
};

// Ruta para verificar assets
app.get('/api/v1/assets/verify', (req, res) => {
  const assetStatus = {};
  
  for (const [key, route] of Object.entries(assetRoutes)) {
    const fullPath = path.join(__dirname, 'public', route);
    assetStatus[key] = {
      path: fullPath,
      route: route,
      exists: true // Aquí podrías añadir una verificación real si lo necesitas
    };
  }

  res.json({ 
    success: true,
    assets: assetStatus 
  });
});

const PORT = process.env.PORT || 3000;

// Inicialización de la base de datos
async function initializeServer() {
  try {
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      console.error('❌ Error fatal: No es va poder connectar a la base de dades');
      process.exit(1);
    }

    // Rutas API
    app.use('/api/v1', routes);

    // Manejador de errores global
    app.use((err, req, res, next) => {
      console.error('Error no controlat:', err);
      res.status(500).json({
        success: false,
        message: 'Error intern del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
🚀 Servidor iniciat correctament:
   - Port: ${PORT}
   - Mode: ${process.env.NODE_ENV || 'development'}
   - Base de dades: Connectada
   - Assets: ${Object.keys(assetRoutes).join(', ')}
      `);
    });

  } catch (error) {
    console.error('❌ Error fatal durant l\'inicialització:', error);
    process.exit(1);
  }
}

initializeServer();