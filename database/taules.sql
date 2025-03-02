-- Crear la base de dades
CREATE DATABASE flappywars_db;
USE flappywars_db;

-- CRUD SIMPLE (taula sense claus forànies)
CREATE TABLE naus (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(50) NOT NULL,
    velocitat INT NOT NULL DEFAULT 1,
    imatge_url VARCHAR(255),
    descripcio TEXT,
    punts_requerits INT NOT NULL,
    data_creacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Taula principal d'usuaris
CREATE TABLE usuaris (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom_usuari VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    contrasenya VARCHAR(255) NOT NULL,
    nivell INT DEFAULT 1,
    punts_totals INT DEFAULT 0,
    data_registre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultim_acces TIMESTAMP,
    estat ENUM('actiu', 'inactiu', 'bloquejat') DEFAULT 'actiu',
    intents_login INT DEFAULT 0,
    nau_actual CHAR(36),
    rol ENUM ('user','admin') DEFAULT 'user',
    FOREIGN KEY (nau_actual) REFERENCES naus(id) ON DELETE SET NULL
);

-- Taula de partides (1 usuari pot tenir moltes partides)
CREATE TABLE partides (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuari_id CHAR(36) NOT NULL,
    puntuacio INT NOT NULL DEFAULT 0,
    duracio_segons INT NOT NULL,
    nau_utilitzada CHAR(36) NOT NULL, 
    data_partida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    obstacles_superats INT DEFAULT 0,
    completada BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id) ON DELETE CASCADE,
    FOREIGN KEY (nau_utilitzada) REFERENCES naus(id) ON DELETE CASCADE
);

-- Taula de nivells
CREATE TABLE nivells (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(100) NOT NULL,
    imatge_url VARCHAR(255),
    punts_requerits INT NOT NULL
);

-- Relación N:M entre nivells i naus
CREATE TABLE nivells_naus (
    nivell_id CHAR(36) NOT NULL,
    nau_id CHAR(36) NOT NULL,
    FOREIGN KEY (nivell_id) REFERENCES nivells(id) ON DELETE CASCADE,
    FOREIGN KEY (nau_id) REFERENCES naus(id) ON DELETE CASCADE
);

-- Taula d'obstacles
CREATE TABLE obstacles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    imatge_url VARCHAR(255)
);

-- Relación N:M entre obstacles i partides
CREATE TABLE obstacles_partides (
    obstacle_id CHAR(36) NOT NULL,
    partida_id CHAR(36) NOT NULL,
    posicioX INT NOT NULL,
    posicioY INT NOT NULL,
    FOREIGN KEY (obstacle_id) REFERENCES obstacles(id) ON DELETE CASCADE,
    FOREIGN KEY (partida_id) REFERENCES partides(id) ON DELETE CASCADE
);

-- Relació N:M entre partides, usuaris i naus (per registrar posició en temps real)
CREATE TABLE partida_usuari_nau (
    partida_id CHAR(36) NOT NULL,
    usuari_id CHAR(36) NOT NULL,
    nau_id CHAR(36) NOT NULL,
    posicioX INT NOT NULL,
    posicioY INT NOT NULL,
    FOREIGN KEY (partida_id) REFERENCES partides(id) ON DELETE CASCADE,
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id) ON DELETE CASCADE,
    FOREIGN KEY (nau_id) REFERENCES naus(id) ON DELETE CASCADE
);

-- Inserts de prova amb punts_requerits en lloc de disponible
INSERT INTO naus (id, nom, velocitat, descripcio, imatge_url, punts_requerits) VALUES
(UUID(), 'X-Wing', 1, 'Nau inicial perfecta per començar', 'assets/images/naus/x-wing.png', 0),
(UUID(), 'TIE Fighter', 2, 'Nau ràpida de l''Imperi', 'assets/images/naus/tie-fighter.png', 500),
(UUID(), 'Millennium Falcon', 3, 'La nau més ràpida', 'assets/images/naus/millennium-falcon.png', 1000);

-- Inserts de nivells
INSERT INTO nivells (id, nom, imatge_url, punts_requerits) VALUES
(UUID(), 'Pilot Novell', 'assets/images/nivells/novell.png', 0),
(UUID(), 'As Espacial', 'assets/images/nivells/as.png', 1000),
(UUID(), 'Mestre Jedi', 'assets/images/nivells/jedi.png', 300);

-- Inserts d'obstacles
INSERT INTO obstacles (id, imatge_url) VALUES
(UUID(), 'assets/images/obstacles/asteroide.png'),

--Inser usuari admin
INSERT INTO usuaris (id, nom_usuari, email, contrasenya, nivell, punts_totals, estat, rol, nau_actual) 
VALUES (
    UUID(), 
    'admin', 
    'admin@gmail.com', 
    '$2b$10$3euPcmQFCiblsZeEu5s7p.ELGjfYcuVYVS.szlEWprZsEumvp3teG', 
    10, 
    9999, 
    'actiu', 
    'admin',
    (SELECT id FROM naus WHERE nom = 'Millennium Falcon' LIMIT 1)
);
