-- Crear la base de dades
CREATE DATABASE flappywars_db;
USE flappywars_db;

--CRUD SIMPLE (taula sense claus foraneas)
--taula naus espaciales
CREATE TABLE naus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    velocitat INT NOT NULL DEFAULT 1,
    imatge_url VARCHAR(255),
    descripcio TEXT,
    disponible BOOLEAN DEFAULT true,
    data_creacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Taula principal d'usuaris
-- Gestiona l'autenticació i progrés del jugador
CREATE TABLE usuaris (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom_usuari VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasenya VARCHAR(255) NOT NULL,
    nivell INT DEFAULT 1,
    punts_totals INT DEFAULT 0,
    data_registre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultim_acces TIMESTAMP,
    estat ENUM('actiu', 'inactiu', 'bloquejat') DEFAULT 'actiu',
    intents_login INT DEFAULT 0,
    nau_actual INT,
    FOREIGN KEY (nau_actual) REFERENCES naus(id)
);