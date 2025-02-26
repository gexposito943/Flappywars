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
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware per senejar dades de les peticions
router.use(sanitizeData);

// Rutes públiques (sense autenticació)
router.post("/register", registerUsers);
router.post("/login", loginUser);
router.get("/stats/global", getGlobalStats);
router.get('/ships', getShips);

// Añadir la ruta de refresh token ANTES del middleware de autenticación
router.post("/refresh-token", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    try {
      // Verificar el token pero ignorar la expiración
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
      
      // Obtener datos del usuario
      const [user] = await db.query(
        'SELECT * FROM usuaris WHERE id = ? AND estat = "actiu"',
        [decoded.userId]
      );
      
      if (!user.length) {
        return res.status(401).json({
          success: false,
          message: 'Usuari no trobat o inactiu'
        });
      }
      
      // Generar nuevo token
      const newToken = jwt.sign(
        { 
          userId: decoded.userId,
          email: decoded.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1m' } // Para pruebas
      );
      
      // Actualizar último acceso
      await db.query(
        'UPDATE usuaris SET ultim_acces = NOW() WHERE id = ?',
        [decoded.userId]
      );
      
      res.json({
        success: true,
        token: newToken,
        user: user[0]
      });
      
    } catch (error) {
      if (error.name !== 'TokenExpiredError') {
        return res.status(403).json({
          success: false,
          message: 'Token inválido',
          error: error.message
        });
      }
      
      // Si es TokenExpiredError, continuamos con el proceso
      const decoded = jwt.decode(token);
      
      if (!decoded || !decoded.userId) {
        return res.status(403).json({
          success: false,
          message: 'Token malformado'
        });
      }
      
      // Resto del código igual que arriba
      const [user] = await db.query(
        'SELECT * FROM usuaris WHERE id = ? AND estat = "actiu"',
        [decoded.userId]
      );
      
      if (!user.length) {
        return res.status(401).json({
          success: false,
          message: 'Usuari no trobat o inactiu'
        });
      }
      
      const newToken = jwt.sign(
        { 
          userId: decoded.userId,
          email: decoded.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1m' }
      );
      
      await db.query(
        'UPDATE usuaris SET ultim_acces = NOW() WHERE id = ?',
        [decoded.userId]
      );
      
      res.json({
        success: true,
        token: newToken,
        user: user[0]
      });
    }
  } catch (error) {
    console.error('Error en refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al refrescar el token',
      error: error.message
    });
  }
});

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
