import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query, transaction } from "../database.js";

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
        const [existingUsers] = await query(
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
        const [naus] = await query(
            'SELECT id FROM naus WHERE nom = "X-Wing" AND punts_requerits = 0 LIMIT 1'
        );
        if (!naus.length) {
            return res.status(500).json({
                success: false,
                error: "No s'ha trobat la nau inicial"
            });
        }
        // Crear nou usuari
        const [result] = await query(
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
        const [users] = await query(`
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

        if (!user) {
            console.log('Usuario no encontrado:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        const isPasswordValid = await bcrypt.compare(contrasenya, user.contrasenya);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credencials incorrectes'
            });
        }

        // Actualitzar últim accés
        await query('UPDATE usuaris SET ultim_acces = NOW() WHERE id = ?', [user.id]);

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
                rol: user.rol,
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

export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { nom_usuari, email, contrasenya } = req.body;
        
        // Verificar que el usuario existe
        const [user] = await query('SELECT * FROM usuaris WHERE id = ?', [userId]);
        
        if (user.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuari no trobat"
            });
        }

        // Preparar la consulta de actualización
        let updateQuery = 'UPDATE usuaris SET ';
        const updateValues = [];
        
        if (nom_usuari) {
            updateQuery += 'nom_usuari = ?, ';
            updateValues.push(nom_usuari);
        }
        
        if (email) {
            updateQuery += 'email = ?, ';
            updateValues.push(email);
        }
        
        if (contrasenya) {
            const hashedPassword = await bcrypt.hash(contrasenya, 10);
            updateQuery += 'contrasenya = ?, ';
            updateValues.push(hashedPassword);
        }
        
        // Eliminar la última coma y añadir la condición WHERE
        updateQuery = updateQuery.slice(0, -2) + ' WHERE id = ?';
        updateValues.push(userId);

        await query(updateQuery, updateValues);

        // Obtener los datos actualizados del usuario
        const [updatedUser] = await query(`
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
            WHERE u.id = ?
        `, [userId]);

        // Eliminar la contraseña antes de enviar
        delete updatedUser[0].contrasenya;

        res.json({
            success: true,
            message: "Perfil actualitzat correctament",
            user: {
                ...updatedUser[0],
                nau: updatedUser[0].nau_actual ? {
                    id: updatedUser[0].nau_actual,
                    nom: updatedUser[0].nom_nau,
                    imatge_url: updatedUser[0].nau_imatge
                } : null,
                estadistiques: {
                    millor_puntuacio: updatedUser[0].millor_puntuacio || 0,
                    total_partides: updatedUser[0].total_partides || 0,
                    temps_total_jugat: updatedUser[0].temps_total_jugat || 0,
                    total_obstacles: updatedUser[0].total_obstacles || 0
                }
            }
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            message: "Error actualitzant el perfil"
        });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { userId, email } = req.user;

        const [user] = await query(
            'SELECT * FROM usuaris WHERE id = ? AND estat = "actiu"',
            [userId]
        );

        if (!user.length) {
            return res.status(401).json({
                success: false,
                message: 'Usuari no trobat o inactiu'
            });
        }

        // Generar nuevo token con exactamente 24 horas
        const newToken = jwt.sign(
            { 
                userId: userId,
                email: email 
            },
            process.env.JWT_SECRET,
            { 
                expiresIn: '24h' 
            }
        );

        // Actualizar último acceso
        await query(
            'UPDATE usuaris SET ultim_acces = NOW() WHERE id = ?',
            [userId]
        );

        res.json({
            success: true,
            token: newToken,
            user: user[0] 
        });

    } catch (error) {
        console.error('Error en refresh token:', error);
        res.status(500).json({
            success: false,
            message: 'Error al refrescar el token',
            error: error.message
        });
    }
};