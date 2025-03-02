import { query, transaction } from '../database.js';

export const getUserStats = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;
    
    // Obtenir estadístiques generals de l'usuari
    const [userStats] = await query(`
      SELECT 
        u.punts_totals,
        u.nivell,
        n.nom as nivell_nom,
        n.imatge_url as nivell_imatge,
        COUNT(DISTINCT p.id) as total_partides,
        MAX(p.puntuacio) as millor_puntuacio,
        SUM(p.duracio_segons) as temps_total_jugat,
        SUM(p.obstacles_superats) as total_obstacles,
        nau.nom as nau_actual_nom,
        nau.imatge_url as nau_actual_imatge
      FROM usuaris u
      LEFT JOIN partides p ON u.id = p.usuari_id
      LEFT JOIN nivells n ON u.nivell = n.punts_requerits
      LEFT JOIN naus nau ON u.nau_actual = nau.id
      WHERE u.id = ?
      GROUP BY u.id, u.punts_totals, u.nivell, n.nom, n.imatge_url, nau.nom, nau.imatge_url
    `, [userId]);

    // Obtenir últimes 5 partides
    const [ultimesPartides] = await query(`
      SELECT 
        p.*,
        n.nom as nau_nom,
        n.imatge_url as nau_imatge
      FROM partides p
      JOIN naus n ON p.nau_utilitzada = n.id
      WHERE p.usuari_id = ?
      ORDER BY p.data_partida DESC
      LIMIT 5
    `, [userId]);

    // Obtenir següent nivell
    const [nextLevel] = await query(`
      SELECT *
      FROM nivells
      WHERE punts_requerits > ?
      ORDER BY punts_requerits ASC
      LIMIT 1
    `, [userStats[0].punts_totals]);

    res.json({
      success: true,
      estadistiques: {
        general: {
          punts_totals: userStats[0].punts_totals,
          nivell_actual: {
            nivell: userStats[0].nivell,
            nom: userStats[0].nivell_nom,
            imatge: userStats[0].nivell_imatge
          },
          seguent_nivell: nextLevel.length > 0 ? {
            nom: nextLevel[0].nom,
            punts_necessaris: nextLevel[0].punts_requerits - userStats[0].punts_totals,
            imatge: nextLevel[0].imatge_url
          } : null,
          nau_actual: {
            nom: userStats[0].nau_actual_nom,
            imatge: userStats[0].nau_actual_imatge
          }
        },
        partides: {
          total_partides: userStats[0].total_partides || 0,
          millor_puntuacio: userStats[0].millor_puntuacio || 0,
          temps_total_jugat: userStats[0].temps_total_jugat || 0,
          total_obstacles: userStats[0].total_obstacles || 0
        },
        ultimes_partides: ultimesPartides.map(p => ({
          id: p.id,
          puntuacio: p.puntuacio,
          duracio_segons: p.duracio_segons,
          obstacles_superats: p.obstacles_superats,
          data_partida: p.data_partida,
          completada: p.completada,
          nau: {
            nom: p.nau_nom,
            imatge: p.nau_imatge
          }
        }))
      }
    });

  } catch (error) {
    console.error('Error al obtenir estadístiques:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir les estadístiques',
      error: error.message 
    });
  }
};

export const updateStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { puntuacio, temps_jugat, obstacles_superats } = req.body;
    
    // CAMBIO AQUÍ: Usar query en lugar de execute
    await db.query('START TRANSACTION');

    try {
      // Actualitzar punts totals i verificar nivell
      const [userUpdate] = await db.execute(`
        UPDATE usuaris 
        SET 
          punts_totals = punts_totals + ?,
          nivell = (
            SELECT MAX(punts_requerits)
            FROM nivells
            WHERE punts_requerits <= (punts_totals + ?)
          )
        WHERE id = ?
      `, [puntuacio, puntuacio, userId]);

        // Obtenir estadístiques actualitzades
        const [updatedStats] = await connection.query(`
          SELECT 
            u.*,
            n.nom as nivell_nom,
            n.imatge_url as nivell_imatge
          FROM usuaris u
          LEFT JOIN nivells n ON u.nivell = n.punts_requerits
          WHERE u.id = ?
        `, [userId]);

      // CAMBIO AQUÍ: Usar query en lugar de execute
      await db.query('COMMIT');

    res.json({
      success: true,
      message: 'Estadístiques actualitzades correctament',
      estadistiques: {
        punts_totals: updatedStats[0].punts_totals,
        nivell: {
          nivell: updatedStats[0].nivell,
          nom: updatedStats[0].nivell_nom,
          imatge: updatedStats[0].nivell_imatge
        }
      }
    });

    } catch (error) {
      // CAMBIO AQUÍ: Usar query en lugar de execute
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

export const getGlobalStats = async (req, res) => {
  try {
    const [globalStats] = await query(`
      SELECT 
        u.id,
        u.nom_usuari as username,
        u.punts_totals,
        COUNT(p.id) as total_partides,
        MAX(p.puntuacio) as millor_puntuacio,
        SUM(p.duracio_segons) as temps_total_jugat
      FROM usuaris u
      LEFT JOIN partides p ON u.id = p.usuari_id
      GROUP BY u.id, u.nom_usuari, u.punts_totals
      ORDER BY u.punts_totals DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      ranking: globalStats
    });


  } catch (error) {
    console.error('Error al obtenir estadístiques globals:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir les estadístiques globals'
    });
  }
};

export const resetUserStats = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // CAMBIO AQUÍ: Usar query en lugar de execute
        await db.query('START TRANSACTION');

        try {
            // Reutilitzem la mateixa estructura SQL però posant els punts a 0
            const [userUpdate] = await db.execute(`
                UPDATE usuaris 
                SET 
                    punts_totals = 0,
                    nivell = (
                        SELECT MIN(punts_requerits)
                        FROM nivells
                    )
                WHERE id = ?
            `, [userId]);

                // Reutilitzem la consulta per obtenir les estadístiques actualitzades
                const [updatedStats] = await connection.query(`
                    SELECT 
                        u.*,
                        n.nom as nivell_nom,
                        n.imatge_url as nivell_imatge
                    FROM usuaris u
                    LEFT JOIN nivells n ON u.nivell = n.punts_requerits
                    WHERE u.id = ?
                `, [userId]);

            // CAMBIO AQUÍ: Usar query en lugar de execute
            await db.query('COMMIT');

        res.json({
            success: true,
            message: 'Punts reiniciats correctament',
            estadistiques: {
                punts_totals: 0,
                nivell: {
                    nivell: updatedStats[0].nivell,
                    nom: updatedStats[0].nivell_nom,
                    imatge: updatedStats[0].nivell_imatge
                }
            }
        });

        } catch (error) {
            // CAMBIO AQUÍ: Usar query en lugar de execute
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error al reiniciar punts:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al reiniciar els punts',
            error: error.message 
        });
    }
};

export const deleteUser = async (req, res) => {
  try {
      const { userId } = req.params;
      const adminId = req.user.userId; 
      // Verificar si el usuario que hace la petición es admin
      const [admin] = await query(
          'SELECT rol FROM usuaris WHERE id = ?',
          [adminId]
      );

      if (!admin[0] || admin[0].rol !== 'admin') {
          return res.status(403).json({
              success: false,
              message: 'No tens permisos per realitzar aquesta acció'
          });
      }

      // No permet que el admin sesborri a sí mateix
      if (userId === adminId) {
          return res.status(400).json({
              success: false,
              message: 'No pots eliminar el teu propi usuari'
          });
      }

      // Borrar usuari (les partides esborraran en cascada per la configuració de la BD)
      await query('DELETE FROM usuaris WHERE id = ?', [userId]);

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
};