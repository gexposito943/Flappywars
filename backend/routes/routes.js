import express from "express";
import { pool as db } from "../database.js";
import { sanitizeData } from "../middlewares/sanitizeData.js";
import { registerUsers, loginUser, updateUserProfile } from "../controllers/loginController.js";
import { authenticateToken } from "../middlewares/auth.js";
import { 
  getUserStats, 
  updateStats,
  getGlobalStats,
  resetUserStats
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

// Middleware per senejar dades de les peticions
router.use(sanitizeData);

// Rutes públiques (sense autenticació)
router.post("/register", registerUsers);
router.post("/login", loginUser);
router.get("/stats/global", getGlobalStats);
router.get('/ships', getShips);

// Ruta per la nau per defecte
router.get('/ships/default', async (req, res) => {
  try {
    const [defaultShip] = await db.query(`
      SELECT * FROM naus WHERE nom = 'X-Wing' LIMIT 1
    `);

    if (defaultShip.length === 0) {
      throw new Error('No s\'ha trobat la nau per defecte');
    }

    res.json({
      success: true,
      data: defaultShip[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtenir la nau per defecte',
      error: error.message
    });
  }
});

// Rutes protegides (requereixen autenticació)
router.use(authenticateToken);

// Rutes de estadístiques
router.get("/stats/:userId?", getUserStats);
router.post("/stats/update", updateStats);
router.post("/stats/:userId/reset", resetUserStats);

// Rutes de naus de l'usuari
router.get("/user/ship/:userId", getUserShip);
router.get("/user/ship", getUserShip);
router.put("/user/ship/:userId", updateUserShip);

// Rutes de partides
router.post("/game/save", saveGame);
router.get("/game/history", getGameHistory);
router.get("/game/load/:partidaId", loadGame);

// Rutes de gestió d'usuaris
router.put("/usuaris/:userId", updateUserProfile);
router.delete("/usuaris/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.user.userId;

        // Verifiquem si es admin
        const [admin] = await db.query(
            'SELECT rol FROM usuaris WHERE id = ?',
            [adminId]
        );

        if (!admin[0] || admin[0].rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tens permisos per realitzar aquesta acció'
            });
        }

        // No es pot eliminar l'usuari administrador
        if (userId === adminId) {
            return res.status(400).json({
                success: false,
                message: 'No pots eliminar el teu propi usuari'
            });
        }

        // Borrar usuari
        await db.query('DELETE FROM usuaris WHERE id = ?', [userId]);

        res.json({
            success: true,
            message: 'Usuari eliminat correctament'
        });

    } catch (error) {
        console.error('Error al eliminar usuari:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar l\'usuari',
            error: error.message
        });
    }
});

// Logging per debug
router.use((req, res, next) => {
  console.log(`Route accessed: ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  next();
});

export default router;
