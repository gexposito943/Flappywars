import { pool as db } from "../database.js";

/**
 * Obté les estadístiques d'un usuari
 * @async
 * @param {Request} req - Objecte de petició
 * @param {Response} res - Objecte de resposta
 * @description Retorna les estadístiques acumulades de l'usuari (puntuació, partides, temps)
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [stats] = await db.query(
      'SELECT * FROM estadistiques_usuari WHERE usuari_id = ?',
      [userId]
    );
    if (stats.length === 0) {
      await db.query(
        'INSERT INTO estadistiques_usuari (usuari_id) VALUES (?)',
        [userId]
      );
      // Retornar estadístiques inicials
      res.json({
        success: true,
        estadistiques: {
          millor_puntuacio: 0,
          total_partides: 0,
          temps_total_jugat: 0
        }
      });
    } else {
      // Retornar estadístiques existents
      res.json({
        success: true,
        estadistiques: {
          millor_puntuacio: stats[0].millor_puntuacio,
          total_partides: stats[0].total_partides,
          temps_total_jugat: stats[0].temps_total_jugat
        }
      });
    }
  } catch (error) {
    console.error('Error al obtenir estadístiques:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir les estadístiques',
      error: error.message 
    });
  }
};

/**
 * Actualitza les estadístiques d'un usuari després d'una partida
 * @async
 * @param {Request} req - Objecte de petició amb les noves estadístiques
 * @param {Response} res - Objecte de resposta
 * @description Actualitza les estadístiques acumulades després de cada partida
 */
export const updateStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      puntuacio,    
      temps_jugat   
    } = req.body;
    if (typeof puntuacio !== 'number' || typeof temps_jugat !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Les dades de puntuació i temps han de ser números'
      });
    }

    // Actualitzar estadístiques
    // - Millor puntuació: es guarda la més alta
    // - Total partides: s'incrementa en 1
    // - Temps total: s'acumula el temps jugat
    await db.query(`
      UPDATE estadistiques_usuari 
      SET 
        millor_puntuacio = GREATEST(millor_puntuacio, ?),
        total_partides = total_partides + 1,
        temps_total_jugat = temps_total_jugat + ?
      WHERE usuari_id = ?
    `, [puntuacio, temps_jugat, userId]);
    const [updatedStats] = await db.query(
      'SELECT * FROM estadistiques_usuari WHERE usuari_id = ?',
      [userId]
    );
    res.json({
      success: true,
      message: 'Estadístiques actualitzades correctament',
      estadistiques: updatedStats[0]
    });
  } catch (error) {
    console.error('Error al actualitzar estadístiques:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualitzar les estadístiques',
      error: error.message 
    });
  }
};

