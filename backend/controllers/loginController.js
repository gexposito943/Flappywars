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
            'SELECT id FROM naus WHERE nom = "X-Wing" AND punts_requerits = 0 LIMIT 1'
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false,
                errors: errors.array() 
            });
        }

        const { email, contrasenya } = req.body;

        // Obtenir usuari amb estadístiques 
        const [users] = await db.query(`
            SELECT 
                u.*,
                n.nom as nom_nau,
                n.imatge_url as nau_imatge,
                (SELECT MAX(puntuacio) FROM partides WHERE usuari_id = u.id) as millor_puntuacio,
                (SELECT COUNT(*) FROM partides WHERE usuari_id = u.id) as total_partides,
                (SELECT SUM(duracio_segons) FROM partides WHERE usuari_id = u.id) as temps_total_jugat,
                (SELECT SUM(obstacles_superats) FROM partides WHERE usuari_id = u.id) as total_obstacles
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

        if (!contrasenya || !user.contrasenya) {
            return res.status(400).json({
                success: false,
                message: 'Falten credencials'
            });
        }

        const validPassword = await bcrypt.compare(contrasenya, user.contrasenya);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credencials incorrectes'
            });
        }

        // Actualitzar últim accés
        await db.query('UPDATE usuaris SET ultim_acces = NOW() WHERE id = ?', [user.id]);

        // Generar token
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
            token: token,
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
                } : null,
                estadistiques: {
                    millor_puntuacio: user.millor_puntuacio || 0,
                    total_partides: user.total_partides || 0,
                    temps_total_jugat: user.temps_total_jugat || 0,
                    total_obstacles: user.total_obstacles || 0
                }
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