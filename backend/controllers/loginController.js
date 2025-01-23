/**
 * @fileoverview Controlador per gestionar l'autenticació d'usuaris
 * @description Gestiona el registre i login d'usuaris amb JWT
 */

import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool as db } from "../database.js";

/**
 * Registra un nou usuari al sistema
 * @async
 * @param {Request} req - Objecte de petició amb les dades de registre
 * @param {Response} res - Objecte de resposta
 * @description Crea un nou usuari amb la seva nau inicial i estadístiques
 */
export const registerUsers = async (req, res) => {
    try {
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { username, email, password } = req.body;
        const [existingUsers] = await db.execute(
            'SELECT * FROM usuaris WHERE nom_usuari = ? OR email = ?',
            [username, email]
        );
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: "L'usuari o email ja existeix" 
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        // Obtenir X-Wing com a nau inicial
        const [naus] = await db.execute(
            'SELECT id FROM naus WHERE nom = "X-Wing" AND disponible = true LIMIT 1'
        );
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
        await db.execute(
            'INSERT INTO estadistiques_usuari (usuari_id) VALUES (?)',
            [result.insertId]
        );
        res.status(201).json({ 
            success: true,
            message: "Usuari registrat correctament"
        });

    } catch (error) {
        console.error('Error al registrar usuari:', error);
        res.status(500).json({ 
            success: false,
            error: "Error al registrar l'usuari" 
        });
    }
};

/**
 * Autentica un usuari i genera un token JWT
 * @async
 * @param {Request} req - Objecte de petició amb les credencials
 * @param {Response} res - Objecte de resposta
 * @description Verifica les credencials i retorna un token JWT si són correctes
 */
export const loginUsers = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute(
            `SELECT u.*, n.nom as nom_nau 
             FROM usuaris u 
             LEFT JOIN naus n ON u.nau_actual = n.id 
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: "Usuari no trobat" 
            });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.contrasenya);
        if (!match) {
            // Incrementar intents fallits
            await db.execute(
                'UPDATE usuaris SET intents_login = intents_login + 1 WHERE id = ?',
                [user.id]
            );
            return res.status(401).json({ 
                success: false,
                error: "Contrasenya incorrecta" 
            });
        }

        // Actualitzar últim accés i reiniciar intents
        await db.execute(
            `UPDATE usuaris 
             SET ultim_acces = CURRENT_TIMESTAMP,
                 intents_login = 0
             WHERE id = ?`,
            [user.id]
        );

        // Generar token JWT
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.nom_usuari,
                currentShip: user.nau_actual
            },
            process.env.SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Retornar resposta amb token i dades d'usuari
        res.status(200).json({ 
            success: true,
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
        res.status(500).json({ 
            success: false,
            error: "Error al iniciar sessió" 
        });
    }
};
