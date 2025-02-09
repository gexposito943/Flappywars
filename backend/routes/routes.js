import express from "express";
import { pool as db } from "../database.js";
import { sanitizeData } from "../middlewares/sanitizeData.js";
import { registerUsers, loginUser } from "../controllers/loginController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { 
  getUserStats, 
  updateStats,
  getGlobalStats
} from "../controllers/statsController.js";
import { 
  saveGame, 
  getGameHistory,
  loadGame
} from "../controllers/gameController.js";
import {
  getShips,
  getUserShip,
  updateUserShip
} from "../controllers/shipController.js";

const router = express.Router();

// Middleware para sanear datos
router.use(sanitizeData);

// Rutas públicas (sin autenticación)
router.post("/register", registerUsers);
router.post("/login", loginUser);
router.get("/stats/global", getGlobalStats);
router.get('/ships', getShips);

// Ruta para nave por defecto
router.get('/ships/default', async (req, res) => {
  try {
    const [defaultShip] = await db.query(`
      SELECT * FROM naus WHERE nom = 'X-Wing' LIMIT 1
    `);

    if (defaultShip.length === 0) {
      throw new Error('No se encontró la nave por defecto');
    }

    res.json({
      success: true,
      data: defaultShip[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la nave por defecto',
      error: error.message
    });
  }
});

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas de estadísticas
router.get("/stats/:userId?", getUserStats);
router.post("/stats/update", updateStats);

// Rutas de naves del usuario
router.get("/user/ship/:userId", getUserShip);
router.get("/user/ship", getUserShip);
router.put("/user/ship", updateUserShip);

// Rutas de partidas
router.post("/game/save", saveGame);
router.get("/game/history", getGameHistory);
router.get("/game/load/:partidaId", loadGame);

// Logging para debug
router.use((req, res, next) => {
  console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  next();
});

export default router;
