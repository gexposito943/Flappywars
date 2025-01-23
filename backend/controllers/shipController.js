/**
 * @fileoverview Controlador per gestionar les naus del joc
 * @description Gestiona les operacions relacionades amb les naus dels usuaris
 */

import { pool as db } from "../database.js";

/**
 * Obté totes les naus disponibles
 * @async
 * @param {Request} req - Objecte de petició
 * @param {Response} res - Objecte de resposta
 * @description Retorna totes les naus que poden ser utilitzades en el joc
 */
export const getShips = async (req, res) => {
  try {
    const [naus] = await db.query('SELECT * FROM naus WHERE disponible = true');
    res.json({
      success: true,
      naus: naus
    });
  } catch (error) {
    console.error('Error al obtenir naus:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir les naus',
      error: error.message 
    });
  }
};

/**
 * Obté la nau actual d'un usuari específic
 * @async
 * @param {Request} req - Objecte de petició amb l'ID de l'usuari
 * @param {Response} res - Objecte de resposta
 * @description Retorna la informació de la nau que l'usuari té seleccionada actualment
 */
export const getUserShip = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.query(`
      SELECT n.* 
      FROM naus n 
      INNER JOIN usuaris u ON u.nau_actual = n.id 
      WHERE u.id = ?
    `, [userId]);
    
    if (rows.length === 0) {
      const [defaultShip] = await db.query('SELECT * FROM naus WHERE nom = "X-Wing"');
      res.json({
        success: true,
        nau: defaultShip[0]
      });
    } else {
      res.json({
        success: true,
        nau: rows[0]
      });
    }
  } catch (error) {
    console.error('Error al obtenir nau del usuari:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir la nau del usuari',
      error: error.message 
    });
  }
};

/**
 * Actualitza la nau seleccionada per l'usuari
 * @async
 * @param {Request} req - Objecte de petició amb l'ID de l'usuari i la nova nau
 * @param {Response} res - Objecte de resposta
 * @description Canvia la nau actual de l'usuari per una nova seleccionada
 */
export const updateUserShip = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { shipId } = req.body;
    const [shipExists] = await db.query(
      'SELECT id FROM naus WHERE id = ? AND disponible = true',
      [shipId]
    );

    if (shipExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La nau seleccionada no existeix o no està disponible'
      });
    }
    
    await db.query(
      'UPDATE usuaris SET nau_actual = ? WHERE id = ?',
      [shipId, userId]
    );

    res.json({ 
      success: true,
      message: 'Nau actualitzada correctament'
    });
  } catch (error) {
    console.error('Error al actualitzar nau del usuari:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualitzar la nau del usuari',
      error: error.message 
    });
  }
};

/**
 * Obté les naus disponibles per a un usuari específic
 * @async
 * @param {Request} req - Objecte de petició
 * @param {Response} res - Objecte de resposta
 * @description Retorna totes les naus que l'usuari pot utilitzar
 */
export const getUserShips = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [ships] = await db.query(`
      SELECT n.* 
      FROM naus n
      WHERE n.disponible = true
      OR n.id IN (
        SELECT nau_actual 
        FROM usuaris 
        WHERE id = ?
      )
    `, [userId]);
    
    res.json({
      success: true,
      naus: ships
    });
  } catch (error) {
    console.error('Error al obtenir naus del usuari:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir les naus del usuari',
      error: error.message 
    });
  }
};

/**
 * Obté els assoliments d'un usuari
 * @async
 * @param {Request} req - Objecte de petició
 * @param {Response} res - Objecte de resposta
 * @description Retorna tots els assoliments i indica quins ha completat l'usuari
 */
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [achievements] = await db.query(`
      SELECT 
        a.*,
        CASE WHEN ua.usuari_id IS NOT NULL THEN true ELSE false END as completat
      FROM assoliments a
      LEFT JOIN usuari_assoliments ua ON a.id = ua.assoliment_id AND ua.usuari_id = ?
      ORDER BY a.punts_requerits ASC
    `, [userId]);
    
    res.json({
      success: true,
      assoliments: achievements
    });
  } catch (error) {
    console.error('Error al obtenir assoliments:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir els assoliments del usuari',
      error: error.message 
    });
  }
};
