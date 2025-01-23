/**
 * @fileoverview Controlador per gestionar les partides del joc
 * @description Gestiona el guardat i la consulta de partides dels usuaris
 */

import { pool as db } from "../database.js";

/**
 * Guarda una nova partida a la base de dades
 * @async
 * @param {Request} req - Objecte de petició amb les dades de la partida
 * @param {Response} res - Objecte de resposta
 * @description 
 */
export const saveGame = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      puntuacio,          
      duracio_segons,      
      nau_utilitzada,      
      obstacles_superats   
    } = req.body;
    
    // Insereix la nova partida a la base de dades
    await db.query(`
      INSERT INTO partides 
      (usuari_id, puntuacio, duracio_segons, nau_utilitzada, obstacles_superats)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, puntuacio, duracio_segons, nau_utilitzada, obstacles_superats]);
    
    res.json({ 
      success: true,
      message: 'Partida guardada correctament'
    });

  } catch (error) {
    console.error('Error al guardar partida:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al guardar la partida',
      error: error.message 
    });
  }
};

/**
 * Obté l'historial de partides d'un usuari
 * @async
 * @param {Request} req - 
 * @param {Response} res - 
 * @description Retorna les últimes 10 partides de l'usuari ordenades per data
 */
export const getGameHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Consulta les últimes 10 partides amb informació de la nau utilitzada
    const [partides] = await db.query(`
      SELECT 
        p.*,                    // Tota la informació de la partida
        n.nom as nom_nau,       // Nom de la nau utilitzada
        n.imatge_url           // URL de la imatge de la nau
      FROM partides p
      JOIN naus n ON p.nau_utilitzada = n.id
      WHERE p.usuari_id = ?
      ORDER BY p.data_partida DESC
      LIMIT 10
    `, [userId]);
    
    res.json({
      success: true,
      partides: partides
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir l\'historial de partides',
      error: error.message
    });
  }
};

