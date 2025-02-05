import fs from "fs";
import path from "path";

// Definir la ruta del fitxer de logs relativa al backend
const LOG_FILE = path.join("backend", "logs", "api.log");

// Assegurar que existeix el directori de logs
const LOG_DIR = path.join("backend", "logs");
if (!fs.existsSync(LOG_DIR)){
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method || "UNKNOWN";
  const url = req.url || "UNKNOWN";
  const ip = req.ip || req.connection.remoteAddress;
  const userId = req.user?.userId || "NO_USER";

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const responseTime = res.get('X-Response-Time') || '0ms';
    
    // Format del log: timestamp, mètode, url, estat, ip, usuari i temps de resposta
    const logEntry = `[${timestamp}] ${method} ${url} - Status: ${statusCode} - IP: ${ip} - User: ${userId} - Time: ${responseTime}\n`;

    // Escriure al fitxer de logs
    fs.appendFile(LOG_FILE, logEntry, (err) => {
      if (err) {
        console.error("Error escrivint al fitxer de logs:", err.message);
      }
    });

    // Log a la consola en mode desenvolupament
    if (process.env.NODE_ENV === 'development') {
      console.log(logEntry.trim());
    }
  });

  next();
};
