import express from "express";
import { sanitizeData } from "../middlewares/sanitizeData.js";
import { registerUsers, loginUsers } from "../controllers/loginController.js";
import {
  getCompetenciesEspecifiques,
  getCriterisAvaluacio,
} from "../controllers/competenciesController.js";
import { authenticateToken } from "../middlewares/auth.js";
import {
  getSabers,
  getSabersCategoria,
} from "../controllers/sabersController.js";

import {
  createSda,
  getSdasWithCriteris,
  saveCriteris,
} from "../controllers/sdaController.js";

const router = express.Router();

// Middleware per sanejar les dades entrades
router.use(sanitizeData);

// Endpoint per a registre i login d'usuaris
router.post("/register", registerUsers);
router.post("/login", loginUsers);

// Endpoints per obtenir les competències específiques i els criteris d'avaluació
router.get(
  "/competencies-especifiques",
  authenticateToken, // Autenticació necessària
  getCompetenciesEspecifiques // Funció que obtingui les competències específiques
);

router.get(
  "/criteris-avaluacio",
  authenticateToken, // Autenticació necessària
  getCriterisAvaluacio // Funció que obtingui els criteris d'avaluació
);

// Endpoints per obtenir els sabers de categoria i els sabers
router.get(
  "/sabers-categoria",
  authenticateToken, // Autenticació necessària
  getSabersCategoria // Funció que obtingui els sabers de categoria
);

router.get(
  "/sabers",
  authenticateToken, // Autenticació necessària
  getSabers // Funció que obtingui els sabers
);

//Routa per crear sda
router.post("/sda", authenticateToken, createSda);
router.post("/sda/criteris", authenticateToken, saveCriteris);
router.get("/sda/info", authenticateToken, getSdasWithCriteris);
export default router;
