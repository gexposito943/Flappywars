import fs from "fs";

export const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method || "UNKNOWN";
  const url = req.url || "UNKNOWN";

  res.on("finish", () => {
    const statusCode = res.statusCode;
    const logEntry = `${timestamp} - ${method} ${url} - Status: ${statusCode}\n`;

    fs.appendFile("api.log", logEntry, (err) => {
      if (err) {
        console.error("Error escribint al fitxer de logs", err);
      }
    });
  });
  next();
};
