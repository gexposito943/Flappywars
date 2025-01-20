import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import db from "../dbConnect.js";
import sql from "mssql";
import jwt from "jsonwebtoken";

export const registerUsers = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }

  const { user, email, password } = req.body;
  console.log("Dades rebudes en el servidor:", req.body);

  try {
    const pool = await db();
    const hashedPassword = await bcrypt.hash(password, 10);
    const uuid = uuidv4();

    await pool
      .request()
      .input("uuid", sql.UniqueIdentifier, uuid)
      .input("user", sql.VarChar, user)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashedPassword)
      .query(
        "INSERT INTO usuaris (uuid, username, email, [password]) VALUES (@uuid, @user, @email, @password)"
      );

    res.status(200).json({ message: "Usuari registrat correctament" });
  } catch (error) {
    console.error("Error al registrar l'usuari", error);
    res.status(500).json({ error: "Error al registrar l'usuari" });
  }
};

export const loginUsers = async (req, res) => {
  const { username, password } = req.body;
  try {
    const pool = await db();
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM usuaris WHERE username = @username");

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Usuari no trobat" });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Contrasenya incorrecta" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.user },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error al iniciar sessió:", error);
    res.status(500).json({ error: "Error al iniciar sessió" });
  }
};
