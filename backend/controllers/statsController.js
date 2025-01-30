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
    // Obtener estadísticas y puntos totales en una sola consulta
    const [stats] = await db.query(
      `SELECT e.*, u.punts_totals 
       FROM estadistiques_usuari e 
       LEFT JOIN usuaris u ON e.usuari_id = u.id 
       WHERE e.usuari_id = ?`,
      [userId]
    );

    if (stats.length === 0) {
      await db.query(
        'INSERT INTO estadistiques_usuari (usuari_id) VALUES (?)',
        [userId]
      );
      res.json({
        success: true,
        estadistiques: {
          millor_puntuacio: 0,
          total_partides: 0,
          temps_total_jugat: 0,
          punts_totals: 0
        }
      });
    } else {
      res.json({
        success: true,
        estadistiques: {
          millor_puntuacio: stats[0].millor_puntuacio,
          total_partides: stats[0].total_partides,
          temps_total_jugat: stats[0].temps_total_jugat,
          punts_totals: stats[0].punts_totals
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
    const { puntuacio, temps_jugat } = req.body;
    
    if (typeof puntuacio !== 'number' || typeof temps_jugat !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Les dades de puntuació i temps han de ser números'
      });
    }

    // Iniciar transacción
    await db.query('START TRANSACTION');

    try {
      // Actualizar estadísticas
      await db.query(`
        UPDATE estadistiques_usuari 
        SET 
          millor_puntuacio = GREATEST(millor_puntuacio, ?),
          total_partides = total_partides + 1,
          temps_total_jugat = temps_total_jugat + ?
        WHERE usuari_id = ?
      `, [puntuacio, temps_jugat, userId]);

      // Actualizar puntos totales del usuario
      await db.query(`
        UPDATE usuaris 
        SET punts_totals = punts_totals + ? 
        WHERE id = ?
      `, [puntuacio, userId]);

      // Obtener estadísticas actualizadas
      const [updatedStats] = await db.query(
        `SELECT e.*, u.punts_totals 
         FROM estadistiques_usuari e 
         JOIN usuaris u ON e.usuari_id = u.id 
         WHERE e.usuari_id = ?`,
        [userId]
      );

      // Confirmar transacción
      await db.query('COMMIT');

      res.json({
        success: true,
        message: 'Estadístiques actualitzades correctament',
        estadistiques: {
          millor_puntuacio: updatedStats[0].millor_puntuacio,
          total_partides: updatedStats[0].total_partides,
          temps_total_jugat: updatedStats[0].temps_total_jugat,
          punts_totals: updatedStats[0].punts_totals
        }
      });
    } catch (error) {
      // Revertir transacción si hay error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error al actualitzar estadístiques:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualitzar les estadístiques',
      error: error.message 
    });
  }
};

