import { body, validationResult } from "express-validator";

// Regles de validació específiques per cada tipus de camp
const validationRules = {
  // Camps d'usuari
  nom_usuari: body('nom_usuari')
    .trim()
    .escape()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nom d\'usuari ha de tenir entre 3 i 50 caràcters'),
  
  email: body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Cal proporcionar un email vàlid'),
  
  contrasenya: body('contrasenya')
    .trim()
    .isLength({ min: 6 })
    .withMessage('La contrasenya ha de tenir almenys 6 caràcters'),

  // Camps de partida
  puntuacio: body('puntuacio')
    .isInt({ min: 0 })
    .withMessage('La puntuació ha de ser un número positiu'),
  
  duracio_segons: body('duracio_segons')
    .isInt({ min: 0 })
    .withMessage('La duració ha de ser un número positiu'),

  // Camps de posició
  posicioX: body('posicioX')
    .isInt()
    .withMessage('La posició X ha de ser un número enter'),
  
  posicioY: body('posicioY')
    .isInt()
    .withMessage('La posició Y ha de ser un número enter')
};

export const sanitizeData = (req, res, next) => {
  try {
    // Aplicar regles només als camps que existeixen al body
    Object.keys(req.body).forEach(key => {
      if (validationRules[key]) {
        validationRules[key].run(req);
      } else {
        // Per camps sense regles específiques, aplicar sanitització bàsica
        body(key).trim().escape().run(req);
      }
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          camp: err.param,
          missatge: err.msg,
          valorRebut: err.value
        }))
      });
    }

    next();
  } catch (error) {
    console.error('Error en la sanitització de dades:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en processar les dades',
      error: error.message 
    });
  }
};

// Middleware específic per validar dades de partida
export const validateGameData = (req, res, next) => {
  const gameRules = [
    validationRules.puntuacio,
    validationRules.duracio_segons,
    validationRules.posicioX,
    validationRules.posicioY
  ];

  Promise.all(gameRules.map(rule => rule.run(req)))
    .then(() => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false,
          errors: errors.array().map(err => ({
            camp: err.param,
            missatge: err.msg,
            valorRebut: err.value
          }))
        });
      }
      next();
    })
    .catch(error => {
      console.error('Error en la validació de dades de partida:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error en processar les dades de partida',
        error: error.message 
      });
    });
};

