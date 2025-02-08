import { pool as db } from "../database.js";

export const getShips = async (req, res) => {
  try {
    const [naus] = await db.query(`
      SELECT 
        id,
        nom,
        velocitat,
        imatge_url,
        descripcio,
        punts_requerits
      FROM naus
      ORDER BY punts_requerits ASC
    `);

    res.json({
      success: true,
      naus: naus.map(nau => ({
        id: nau.id,
        nom: nau.nom,
        velocitat: nau.velocitat,
        imatge_url: nau.imatge_url,
        descripcio: nau.descripcio,
        punts_requerits: nau.punts_requerits
      }))
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

export const getUserShip = async (req, res) => {
  try {
    const userId = req.params.userId;
    const [rows] = await db.query(`
      SELECT 
        n.*,
        u.punts_totals,
        ni.punts_requerits,
        ni.nom as nivell_nom
      FROM naus n 
      INNER JOIN usuaris u ON u.nau_actual = n.id 
      LEFT JOIN nivells_naus nv ON n.id = nv.nau_id
      LEFT JOIN nivells ni ON nv.nivell_id = ni.id
      WHERE u.id = ?
    `, [userId]);
    
    if (rows.length === 0) {
      // Obtener X-Wing como a nau per defecte
      const [defaultShip] = await db.query(`
        SELECT n.* 
        FROM naus n
        WHERE n.nom = 'X-Wing'
      `);

      res.json({
        success: true,
        nau: {
          id: defaultShip[0].id,
          nom: defaultShip[0].nom,
          velocitat: defaultShip[0].velocitat,
          imatge_url: defaultShip[0].imatge_url,
          descripcio: defaultShip[0].descripcio
        }
      });
    } else {
      res.json({
        success: true,
        nau: {
          id: rows[0].id,
          nom: rows[0].nom,
          velocitat: rows[0].velocitat,
          imatge_url: rows[0].imatge_url,
          descripcio: rows[0].descripcio,
          nivell_requerit: rows[0].nivell_nom ? {
            nom: rows[0].nivell_nom,
            punts_requerits: rows[0].punts_requerits
          } : null
        }
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

export const updateUserShip = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { shipId } = req.body;

    const [shipData] = await db.query(`
      SELECT 
        n.*,
        ni.punts_requerits,
        u.punts_totals
      FROM naus n
      LEFT JOIN nivells_naus nv ON n.id = nv.nau_id
      LEFT JOIN nivells ni ON nv.nivell_id = ni.id
      CROSS JOIN usuaris u
      WHERE n.id = ? AND u.id = ?
    `, [shipId, userId]);

    if (shipData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'La nau seleccionada no existeix'
      });
    }

    // Verificar si el usuario cumple los requisitos de punto 
    if (shipData[0].punts_requerits && shipData[0].punts_totals < shipData[0].punts_requerits) {
      return res.status(403).json({
        success: false,
        message: 'No tens suficients punts per utilitzar aquesta nau'
      });
    }
    
    await db.query(
      'UPDATE usuaris SET nau_actual = ? WHERE id = ?',
      [shipId, userId]
    );

    res.json({ 
      success: true,
      message: 'Nau actualitzada correctament',
      nau: {
        id: shipData[0].id,
        nom: shipData[0].nom,
        velocitat: shipData[0].velocitat,
        imatge_url: shipData[0].imatge_url,
        descripcio: shipData[0].descripcio
      }
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

export const getUserAvailableShips = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Eliminada la referencia a la columna 'disponible'
    const [ships] = await db.query(`
      SELECT 
        n.*,
        ni.punts_requerits,
        ni.nom as nivell_nom,
        u.punts_totals,
        CASE 
          WHEN ni.punts_requerits IS NULL OR u.punts_totals >= ni.punts_requerits 
          THEN true 
          ELSE false 
        END as disponible_per_usuari
      FROM naus n
      LEFT JOIN nivells_naus nv ON n.id = nv.nau_id
      LEFT JOIN nivells ni ON nv.nivell_id = ni.id
      CROSS JOIN usuaris u
      WHERE u.id = ?
      ORDER BY ni.punts_requerits ASC
    `, [userId]);
    
    res.json({
      success: true,
      naus: ships.map(nau => ({
        id: nau.id,
        nom: nau.nom,
        velocitat: nau.velocitat,
        imatge_url: nau.imatge_url,
        descripcio: nau.descripcio,
        disponible: nau.disponible_per_usuari,
        nivell_requerit: nau.nivell_nom ? {
          nom: nau.nivell_nom,
          punts_requerits: nau.punts_requerits,
          punts_faltants: Math.max(0, nau.punts_requerits - nau.punts_totals)
        } : null
      }))
    });
  } catch (error) {
    console.error('Error al obtenir naus disponibles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtenir les naus disponibles',
      error: error.message 
    });
  }
};