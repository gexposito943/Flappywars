import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET no está definida en las variables de entorno");
  process.exit(1);
}

export const authenticateToken = (req, res, next) => {
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
    req.user = decoded;
    console.log('Token verificado para usuario:', decoded);
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Token d\'autenticació invàlid',
      error: error.message 
    });
  }
};
