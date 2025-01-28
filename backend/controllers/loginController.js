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
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Intento de login para:', email);

        // Verificar que se proporcionaron las credenciales
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Es requereixen email i contrasenya'
            });
        }

        // Buscar usuario
        const [users] = await db.query(
            'SELECT * FROM usuaris WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            console.log('Usuario no encontrado:', email);
            return res.status(401).json({
                success: false,
                message: 'Credencials incorrectes'
            });
        }

        const user = users[0];

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.contrasenya);
        if (!validPassword) {
            console.log('Contraseña incorrecta para:', email);
            return res.status(401).json({
                success: false,
                message: 'Credencials incorrectes'
            });
        }

        // Generar token
        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Enviar respuesta exitosa
        res.json({
            success: true,
            message: 'Login correcte',
            token,
            user: {
                id: user.id,
                nom: user.nom_usuari,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: error.message
        });
    }
};
