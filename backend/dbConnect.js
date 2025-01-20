import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustedConnection: true,
    enableArithAbort: true,
    trustServerCertificate: true,
  },
  connectionTimeout: 60000,  
  requestTimeout: 60000,      
};


let pool;

const connectDb = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(config);
      console.log("Connexió amb la base de dades correcta");
    }
    return pool;
  } catch (err) {
    console.error("Error al connectar amb la base de dades:", err.message);
    throw err;
  }
};
connectDb();

export default connectDb;
