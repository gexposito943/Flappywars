import express from "express";
import { sanitizeData } from "../middlewares/sanitizeData.js";
import { registerUsers, loginUsers } from "../controllers/loginController.js";

import { authenticateToken } from "../middlewares/auth.js";


const router = express.Router();

// Middleware per sanejar les dades entrades
router.use(sanitizeData);

// Endpoint per a registre i login d'usuaris
router.post("/register", registerUsers);
router.post("/login", loginUsers);



// Rutas del joc (protegidas)
router.get("/user/stats", authenticateToken, getUserStats);
router.get("/user/achievements", authenticateToken, getUserAchievements);
router.get("/user/ships", authenticateToken, getUserShips);

export default router;
