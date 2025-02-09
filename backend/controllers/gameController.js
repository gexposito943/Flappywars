import { pool as db } from "../database.js";

export const saveGame = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      puntuacio,          
      duracio_segons,      
      nau_utilitzada,
      obstacles_superats,
      posicioX,
      posicioY,
      obstacles,  // Array de obstáculos con sus posiciones
      completada = true
    } = req.body;
    
    // Iniciar transicio
    await db.query('START TRANSACTION');

    try {
      // Insertar partida
      const [result] = await db.query(`
        INSERT INTO partides 
        (usuari_id, puntuacio, duracio_segons, nau_utilitzada, obstacles_superats, completada)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, puntuacio, duracio_segons, nau_utilitzada, obstacles_superats, completada]);

      const partidaId = result.insertId;

      // Guardar posición actual jugador
      await db.query(`
        INSERT INTO partida_usuari_nau 
        (partida_id, usuari_id, nau_id, posicioX, posicioY)
        VALUES (?, ?, ?, ?, ?)
      `, [partidaId, userId, nau_utilitzada, posicioX, posicioY]);

      // Guardar obstáculos
      if (obstacles && obstacles.length > 0) {
        // Obtener el ID del obstáculo por defecto
        const [defaultObstacle] = await db.query('SELECT id FROM obstacles LIMIT 1');
        const obstacleId = defaultObstacle[0].id;

        // Insertar cada obstáculo
        const obstacleValues = obstacles.map(obs => 
          [partidaId, obstacleId, obs.posicioX, obs.posicioY]
        );

        await db.query(`
          INSERT INTO obstacles_partides 
          (partida_id, obstacle_id, posicioX, posicioY)
          VALUES ?
        `, [obstacleValues]);
      }

      // Actualizar puntos del usuario
      await db.query(`
        UPDATE usuaris 
        SET punts_totals = punts_totals + ?
        WHERE id = ?
      `, [puntuacio, userId]);

      // Confirmar transaccio
      await db.query('COMMIT');
      
      res.json({ 
        success: true,
        message: 'Partida guardada correctament',
        partidaId
      });

    } catch (error) {
      // Revertir transaccio si hi ha error
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error al guardar la partida:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al guardar la partida',
      error: error.message 
    });
  }
};

export const getGameHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [partides] = await db.query(`
      SELECT 
        p.*,
        n.nom as nom_nau,
        n.imatge_url as nau_imatge,
        pun.posicioX,
        pun.posicioY
      FROM partides p
      JOIN naus n ON p.nau_utilitzada = n.id
      LEFT JOIN partida_usuari_nau pun ON p.id = pun.partida_id
      WHERE p.usuari_id = ?
      ORDER BY p.data_partida DESC
      LIMIT 10
    `, [userId]);
    
    res.json({
      success: true,
      partides: partides.map(p => ({
        id: p.id,
        puntuacio: p.puntuacio,
        duracio_segons: p.duracio_segons,
        data_partida: p.data_partida,
        obstacles_superats: p.obstacles_superats,
        completada: p.completada,
        nau: {
          id: p.nau_utilitzada,
          nom: p.nom_nau,
          imatge: p.nau_imatge
        },
        posicio: {
          x: p.posicioX,
          y: p.posicioY
        }
      }))
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

// Nova funcio per carregar una partida guardada
export const loadGame = async (req, res) => {
  try {
    const { partidaId } = req.params;
    const userId = req.user.userId;

    // Obtener datos básicos de la partida y posición del jugador
    const [partida] = await db.query(`
      SELECT 
        p.*,
        n.nom as nom_nau,
        n.imatge_url as nau_imatge,
        pun.posicioX,
        pun.posicioY
      FROM partides p
      JOIN naus n ON p.nau_utilitzada = n.id
      LEFT JOIN partida_usuari_nau pun ON p.id = pun.partida_id
      WHERE p.id = ? AND p.usuari_id = ?
    `, [partidaId, userId]);

    if (partida.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partida no trobada'
      });
    }

    // Obtener obstáculos de la partida
    const [obstacles] = await db.query(`
      SELECT 
        op.posicioX,
        op.posicioY,
        o.imatge_url
      FROM obstacles_partides op
      JOIN obstacles o ON op.obstacle_id = o.id
      WHERE op.partida_id = ?
    `, [partidaId]);

    res.json({
      success: true,
      partida: {
        ...partida[0],
        nau: {
          id: partida[0].nau_utilitzada,
          nom: partida[0].nom_nau,
          imatge: partida[0].nau_imatge
        },
        posicio: {
          x: partida[0].posicioX,
          y: partida[0].posicioY
        },
        obstacles: obstacles.map(obs => ({
          posicioX: obs.posicioX,
          posicioY: obs.posicioY,
          imatge: obs.imatge_url
        }))
      }
    });

  } catch (error) {
    console.error('Error al carregar la partida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al carregar la partida',
      error: error.message
    });
  }
};