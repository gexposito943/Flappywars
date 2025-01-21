import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { pool as db } from "../database.js";
import jwt from "jsonwebtoken";

export const registerUsers = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Verificar si l'usuari ja existeix
        const [existingUsers] = await db.execute(
            'SELECT * FROM usuaris WHERE nom_usuari = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "L'usuari o email ja existeix" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Obtenir X-Wing com a nau inicial
        const [naus] = await db.execute(
            'SELECT id FROM naus WHERE nom = "X-Wing" AND disponible = true LIMIT 1'
        );

        // Inserir nou usuari
        const [result] = await db.execute(
            `INSERT INTO usuaris (
                nom_usuari, 
                email, 
                contrasenya, 
                nau_actual,
                nivell,
                punts_totals,
                estat
            ) VALUES (?, ?, ?, ?, 1, 0, 'actiu')`,
            [username, email, hashedPassword, naus[0].id]
        );

        // Crear registre d'estadístiques
        await db.execute(
            'INSERT INTO estadistiques_usuari (usuari_id) VALUES (?)',
            [result.insertId]
        );

        res.status(201).json({ 
            message: "Usuari registrat correctament"
        });

    } catch (error) {
        console.error('Error al registrar usuari:', error);
        res.status(500).json({ error: "Error al registrar l'usuari" });
    }
};

export const loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Obtenir usuari
        const [users] = await db.execute(
            'SELECT u.*, n.nom as nom_nau FROM usuaris u LEFT JOIN naus n ON u.nau_actual = n.id WHERE u.email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: "Usuari no trobat" });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.contrasenya);

        if (!match) {
            // Incrementar intents fallits
            await db.execute(
                'UPDATE usuaris SET intents_login = intents_login + 1 WHERE id = ?',
                [user.id]
            );
            return res.status(401).json({ error: "Contrasenya incorrecta" });
        }

        // Actualitzar últim accés i reiniciar intents
        await db.execute(
            `UPDATE usuaris 
             SET ultim_acces = CURRENT_TIMESTAMP,
                 intents_login = 0
             WHERE id = ?`,
            [user.id]
        );

        // Crear token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.nom_usuari,
                currentShip: user.nau_actual
            },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        res.status(200).json({ 
            token,
            user: {
                id: user.id,
                username: user.nom_usuari,
                nivel: user.nivell,
                puntosTotales: user.punts_totals,
                naveActual: user.nau_actual,
                nombreNave: user.nom_nau
            }
        });

    } catch (error) {
        console.error('Error al iniciar sessió:', error);
        res.status(500).json({ error: "Error al iniciar sessió" });
    }
};
