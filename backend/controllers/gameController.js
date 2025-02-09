import { pool as db } from "../database.js";

export const saveGame = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Log para debug
    console.log('Datos recibidos:', {
      userId,
      body: req.body
    });

    const { 
      puntuacio,          
      duracio_segons,      
      nau_utilitzada,
      obstacles_superats,
      posicioX,
      posicioY,
      obstacles,
      completada = true
    } = req.body;

    // Validar que tenemos todos los datos necesarios
    if (!nau_utilitzada) {
      throw new Error('Falta el ID de la nave');
    }

    // Verificar que la nave existe
    const [nau] = await db.query(
      'SELECT id FROM naus WHERE id = ?',
      [nau_utilitzada]
    );

    if (nau.length === 0) {
      throw new Error(`La nave con ID ${nau_utilitzada} no existe`);
    }
    
    await db.query('START TRANSACTION');

    try {
      console.log('Insertando partida con datos:', {
        userId,
        puntuacio,
        duracio_segons,
        nau_utilitzada,
        obstacles_superats,
        completada
      });

      // Generar UUID para la partida
      const [uuidResult] = await db.query('SELECT UUID() as uuid');
      const partidaId = uuidResult[0].uuid;

      // Insertar partida con UUID específico
      await db.query(`
        INSERT INTO partides 
        (id, usuari_id, puntuacio, duracio_segons, nau_utilitzada, 
         obstacles_superats, completada)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [partidaId, userId, puntuacio, duracio_segons, nau_utilitzada, 
          obstacles_superats, completada]);

      console.log('Partida insertada con ID:', partidaId);

      // Guardar posición actual jugador
      await db.query(`
        INSERT INTO partida_usuari_nau 
        (partida_id, usuari_id, nau_id, posicioX, posicioY)
        VALUES (?, ?, ?, ?, ?)
      `, [partidaId, userId, nau_utilitzada, posicioX, posicioY]);

      // Guardar obstáculos si existen
      if (obstacles && obstacles.length > 0) {
        const [defaultObstacle] = await db.query('SELECT id FROM obstacles LIMIT 1');
        const obstacleId = defaultObstacle[0].id;

        const obstacleValues = obstacles.map(obs => 
          [partidaId, obstacleId, obs.posicioX, obs.posicioY]
        );

        await db.query(`
          INSERT INTO obstacles_partides 
          (partida_id, obstacle_id, posicioX, posicioY)
          VALUES ?
        `, [obstacleValues]);
      }

      // Actualizar estadísticas
      await db.query(`
        UPDATE usuaris u
        SET 
          punts_totals = punts_totals + ?,
          nivell = (
            SELECT MAX(punts_requerits)
            FROM nivells
            WHERE punts_requerits <= (u.punts_totals + ?)
          )
        WHERE id = ?
      `, [puntuacio, puntuacio, userId]);

      await db.query('COMMIT');
      
      res.json({ 
        success: true,
        message: 'Partida guardada correctament',
        partidaId
      });

    } catch (error) {
      console.error('Error en la transacción:', error);
      await db.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error detallado:', error);
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