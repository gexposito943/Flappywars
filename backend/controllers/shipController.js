// shipController.js
const db = require('../db'); // Asegúrate de que tienes la conexión a la base de datos

// Obtener todas las naves
exports.getShips = async (req, res) => {
  try {
    const [naus] = await db.query('SELECT * FROM naus');
    res.json(naus);
  } catch (error) {
    console.error('Error al obtener naves:', error);
    res.status(500).json({ message: 'Error al obtener las naves' });
  }
};

// Puedes agregar más métodos aquí, como crear, actualizar y eliminar naves