import express from "express";
import { sanitizeData } from "../middlewares/sanitizeData.js";
import { registerUsers, loginUsers } from "../controllers/loginController.js";
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

// Middleware per sanejar les dades entrades
router.use(sanitizeData);

// Endpoint per a registre i login d'usuaris
router.post("/register", registerUsers);
router.post("/login", loginUsers);

// Rutas de naves (protegidas)
router.get("/naus", authenticateToken, getShips);
router.get("/users/:userId/ship", authenticateToken, getUserShip);
router.put("/users/:userId/ship", authenticateToken, updateUserShip);

// Rutas de estadísticas (protegidas)
router.get("/user/stats", authenticateToken, getUserStats);
router.put("/user/stats", authenticateToken, updateStats);

// Rutas de partidas (protegidas)
router.post("/game/save", authenticateToken, saveGame);
router.get("/game/history", authenticateToken, getGameHistory);

// Rutas de logros y naves del usuario (protegidas)
router.get("/user/achievements", authenticateToken, getUserAchievements);
router.get("/user/ships", authenticateToken, getUserShips);

export default router;
