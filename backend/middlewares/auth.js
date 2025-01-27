import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET no está definida en las variables de entorno");
  process.exit(1);
}

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("Auth Header recibido:", authHeader);

    // Si la ruta es pública, permitir el acceso sin token
    if (req.path === '/api/v1/login' || req.path === '/api/v1/register') {
      return next();
    }

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No s'ha proporcionat el header d'autorització" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token extraído:", token);

    if (!token) {
      return res.status(401).json({ error: "No s'ha proporcionat el token" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          try {
            const decodedToken = jwt.decode(token);
            const newToken = jwt.sign(
              { 
                userId: decodedToken.userId, 
                username: decodedToken.username,
                currentShip: decodedToken.currentShip
              },
              JWT_SECRET,
              { expiresIn: "1h" }
            );
            res.setHeader("New-Token", newToken);
            req.user = decodedToken;
            return next();
          } catch (renewError) {
            console.error("Error al renovar el token:", renewError);
            return res.status(403).json({
              error: "Error al renovar el token",
              details: renewError.message,
            });
          }
        }

        console.error("Error verificació token:", err);
        return res.status(403).json({
          error: "Token invàlid",
          details: err.message,
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Error en autentificacio:", error);
    return res.status(500).json({
      error: "Error en l'autenticació",
      details: error.message,
    });
  }
};
