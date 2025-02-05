import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool as db } from "../database.js";

export const registerUsers = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { nom_usuari, email, contrasenya } = req.body;
        
        // Verificar usuari
        const [existingUsers] = await db.execute(
            'SELECT * FROM usuaris WHERE nom_usuari = ? OR email = ?',
            [nom_usuari, email]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({ 
                success: false,
                error: "L'usuari o email ja existeix" 
            });
        }

        const hashedPassword = await bcrypt.hash(contrasenya, 10);

        // Obte la nau inicial (X-Wing)
        const [naus] = await db.execute(
            'SELECT id FROM naus WHERE nom = "X-Wing" AND disponible = true LIMIT 1'
        );

        if (!naus.length) {
            return res.status(500).json({
                success: false,
                error: "No s'ha trobat la nau inicial"
            });
        }

        // Crear nou usuari
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
            [nom_usuari, email, hashedPassword, naus[0].id]
        );

        res.status(201).json({ 
            success: true,
            message: "Usuari registrat correctament",
            userId: result.insertId
        });

    } catch (error) {
        console.error('Error al registrar usuari:', error);
        res.status(500).json({ 
            success: false,
            error: "Error al registrar l'usuari" 
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, contrasenya } = req.body;

        if (!email || !contrasenya) {
            return res.status(400).json({
                success: false,
                message: 'Es requereixen email i contrasenya'
            });
        }

        // Buscar usuari amb informació de la nau
        const [users] = await db.query(`
            SELECT u.*, n.nom as nom_nau, n.imatge_url as nau_imatge 
            FROM usuaris u
            LEFT JOIN naus n ON u.nau_actual = n.id
            WHERE u.email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credencials incorrectes'
            });
        }

        const user = users[0];

        const validPassword = await bcrypt.compare(contrasenya, user.contrasenya);
        if (!validPassword) {
            await db.query(
                'UPDATE usuaris SET intents_login = intents_login + 1 WHERE id = ?',
                [user.id]
            );
            
            return res.status(401).json({
                success: false,
                message: 'Credencials incorrectes'
            });
        }

        await db.query(
            'UPDATE usuaris SET ultim_acces = CURRENT_TIMESTAMP, intents_login = 0 WHERE id = ?',
            [user.id]
        );

        const token = jwt.sign(
            { 
                userId: user.id,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login correcte',
            token,
            user: {
                id: user.id,
                nom_usuari: user.nom_usuari,
                email: user.email,
                nivell: user.nivell,
                punts_totals: user.punts_totals,
                data_registre: user.data_registre,
                ultim_acces: user.ultim_acces,
                estat: user.estat,
                intents_login: user.intents_login,
                nau_actual: user.nau_actual,
                nau: user.nau_actual ? {
                    id: user.nau_actual,
                    nom: user.nom_nau,
                    imatge_url: user.nau_imatge
                } : null
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