import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { query } from "../database.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_LOGIN_ATTEMPTS = 5; 

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET no està definit en les variables d'entorn");
  process.exit(1);
}

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ 
      success: false, 
      message: 'No s\'ha proporcionat token d\'autenticació' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar estat de l'usuari
    const user = await query(`
      SELECT id, estat, intents_login, ultim_acces 
      FROM usuaris 
      WHERE id = ?
    `, [decoded.userId]);

    if (user.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuari no trobat' 
      });
    }

    if (user[0].estat !== 'actiu') {
      return res.status(403).json({ 
        success: false, 
        message: 'Compte bloquejat o inactiu' 
      });
    }

    // Actualitzar últim accés
    await query(`
      UPDATE usuaris 
      SET ultim_acces = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [decoded.userId]);

    req.user = {
      ...decoded,
      estat: user[0].estat
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token d\'autenticació expirat',
        details: 'expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: 'Token d\'autenticació invàlid',
        details: 'invalid'
      });
    }
    
    return res.status(403).json({ 
      success: false, 
      message: 'Error d\'autenticació',
      error: error.message 
    });
  }
};

// Nou middleware per verificar intents de login
export const checkLoginAttempts = async (req, res, next) => {
  const { email } = req.body;
  
  try {
    const user = await query(
      'SELECT intents_login, estat FROM usuaris WHERE email = ?',
      [email]
    );

    if (user.length > 0) {
      if (user[0].estat === 'bloquejat') {
        return res.status(403).json({
          success: false,
          message: 'Compte bloquejat per massa intents fallits'
        });
      }

      if (user[0].intents_login >= MAX_LOGIN_ATTEMPTS) {
        await query(
          'UPDATE usuaris SET estat = "bloquejat" WHERE email = ?',
          [email]
        );
        return res.status(403).json({
          success: false,
          message: 'Compte bloquejat per massa intents fallits'
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error verificant intents de login:', error);
    next(error);
  }
};