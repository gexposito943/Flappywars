import { pool as db } from "../database.js";

export const saveGame = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Log per el debug
    console.log('Dades rebudes:', {
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

    // Validar que tenim tots els dades necessarises
    if (!nau_utilitzada) {
      throw new Error('Falta el ID de la nau');
    }

    // Verificar que la nau existeix
    const [nau] = await db.execute(
      'SELECT id FROM naus WHERE id = ?',
      [nau_utilitzada]
    );

    if (nau.length === 0) {
      throw new Error(`La nau amb ID ${nau_utilitzada} no existeix`);
    }
    
    await db.query('START TRANSACTION');

    try {
      console.log('Insertant partida amb dades:', {
        userId,
        puntuacio,
        duracio_segons,
        nau_utilitzada,
        obstacles_superats,
        completada
      });

      // Generar UUID per la partida
      const [uuidResult] = await db.execute('SELECT UUID() as uuid');
      const partidaId = uuidResult[0].uuid;

      // Insertar partida amb UUID específic
      await db.execute(`
        INSERT INTO partides 
        (id, usuari_id, puntuacio, duracio_segons, nau_utilitzada, 
         obstacles_superats, completada)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [partidaId, userId, puntuacio, duracio_segons, nau_utilitzada, 
          obstacles_superats, completada]);

      console.log('Partida insertada con ID:', partidaId);

      // Guardar posició actual jugador
      await db.execute(`
        INSERT INTO partida_usuari_nau 
        (partida_id, usuari_id, nau_id, posicioX, posicioY)
        VALUES (?, ?, ?, ?, ?)
      `, [partidaId, userId, nau_utilitzada, posicioX, posicioY]);

      // Guardar obstacles si existeixen
      if (obstacles && obstacles.length > 0) {
        const [defaultObstacle] = await db.execute('SELECT id FROM obstacles LIMIT 1');
        const obstacleId = defaultObstacle[0].id;

        // Insertar cada obstáculo individualmente
        for (const obs of obstacles) {
          await db.execute(`
            INSERT INTO obstacles_partides 
            (partida_id, obstacle_id, posicioX, posicioY)
            VALUES (?, ?, ?, ?)
          `, [partidaId, obstacleId, obs.posicioX, obs.posicioY]);
        }
      }

      // Actualitzar estadístiques
      await db.execute(`
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
    console.error('Error detallat:', error);
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

    const [partides] = await db.execute(`
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

    // Obtener dades bàsiques de la partida i posició del jugador
    const [partida] = await db.execute(`
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

    // Obtener obstacles de la partida
    const [obstacles] = await db.execute(`
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