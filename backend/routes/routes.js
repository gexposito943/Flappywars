import express from "express";
import { sanitizeData } from "../middlewares/sanitizeData.js";
import { registerUsers, loginUser } from "../controllers/loginController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { 
  getUserStats, 
  updateStats 
} from "../controllers/statsController.js";
import { 
  saveGame, 
  getGameHistory 
} from "../controllers/gameController.js";
import {
  getShips,
  getUserShip,
  updateUserShip,
  getUserShips,
  getUserAchievements
} from "../controllers/shipController.js";

const router = express.Router();

// Middleware para sanear datos
router.use(sanitizeData);

// Rutas públicas
router.post("/register", registerUsers);
router.post("/login", loginUser);

// Rutas protegidas (requieren autenticación)
router.use(authenticateToken);

// Rutas de estadísticas
router.get("/stats/user", getUserStats);
router.post("/stats/update", updateStats);

// Rutas de naves
router.get("/ships", getShips);
router.get("/user/ship", getUserShip);
router.put("/user/ship", updateUserShip);
router.get("/user/ships", getUserShips);

// Rutas de partidas
router.post("/game/save", saveGame);
router.get("/game/history", getGameHistory);

// Rutas de logros
router.get("/user/achievements", getUserAchievements);

// Logging para debug
router.use((req, res, next) => {
  console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  next();
});

export default router;
