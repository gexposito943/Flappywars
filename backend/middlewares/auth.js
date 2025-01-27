import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "No s'ha proporcionat el header d'autorització" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No s'ha proporcionat el token" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          try {
            const decodedToken = jwt.decode(token);

            const newToken = jwt.sign(
              { userId: decodedToken.userId, email: decodedToken.email },
              SECRET_KEY,
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

      const tokenExp = new Date(user.exp * 1000);
      const now = new Date();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (tokenExp - now < fiveMinutes) {
        const newToken = jwt.sign(
          { userId: user.userId, email: user.email },
          SECRET_KEY,
          { expiresIn: "1h" }
        );
        res.setHeader("New-Token", newToken);
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
