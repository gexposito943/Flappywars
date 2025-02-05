-- Crear la base de datos
CREATE DATABASE flappywars_db;
USE flappywars_db;

-- CRUD SIMPLE (tabla sin claves foráneas)
CREATE TABLE naus (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(50) NOT NULL,
    velocitat INT NOT NULL DEFAULT 1,
    imatge_url VARCHAR(255),
    descripcio TEXT,
    disponible BOOLEAN DEFAULT TRUE,
    data_creacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla principal de usuarios
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
    FOREIGN KEY (nau_actual) REFERENCES naus(id) ON DELETE SET NULL
);

-- Tabla de partidas (1 usuario puede tener muchas partidas)
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

-- Tabla de niveles
CREATE TABLE nivells (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nom VARCHAR(100) NOT NULL,
    imatge_url VARCHAR(255),
    punts_requerits INT NOT NULL
);

-- Relación N:M entre niveles y naves
CREATE TABLE nivells_naus (
    nivell_id CHAR(36) NOT NULL,
    nau_id CHAR(36) NOT NULL,
    FOREIGN KEY (nivell_id) REFERENCES nivells(id) ON DELETE CASCADE,
    FOREIGN KEY (nau_id) REFERENCES naus(id) ON DELETE CASCADE
);

-- Tabla de obstáculos
CREATE TABLE obstacles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    imatge_url VARCHAR(255)
);

-- Relación N:M entre obstáculos y partidas
CREATE TABLE obstacles_partides (
    obstacle_id CHAR(36) NOT NULL,
    partida_id CHAR(36) NOT NULL,
    posicioX INT NOT NULL,
    posicioY INT NOT NULL,
    FOREIGN KEY (obstacle_id) REFERENCES obstacles(id) ON DELETE CASCADE,
    FOREIGN KEY (partida_id) REFERENCES partides(id) ON DELETE CASCADE
);

-- Relación N:M entre partidas, usuarios y naves (para registrar posición en tiempo real)
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

-- Inserts de prueba (se debe usar UUID())
INSERT INTO naus (id, nom, velocitat, descripcio, imatge_url, disponible) VALUES
(UUID(), 'X-Wing', 1, 'Nau inicial perfecta per començar', '/assets/images/naus/x-wing.png', TRUE),
(UUID(), 'TIE Fighter', 2, 'Nau ràpida de l''Imperi', '/assets/images/naus/tie-fighter.png', FALSE),
(UUID(), 'Millennium Falcon', 3, 'La nau més ràpida', '/assets/images/naus/millennium-falcon.png', FALSE);

-- Inserts de niveles
INSERT INTO nivells (id, nom, imatge_url, punts_requerits) VALUES
(UUID(), 'Pilot Novell', '/assets/images/nivells/novell.png', 0),
(UUID(), 'As Espacial', '/assets/images/nivells/as.png', 1000),
(UUID(), 'Mestre Jedi', '/assets/images/nivells/jedi.png', 300);

-- Inserts de obstáculos
INSERT INTO obstacles (id, imatge_url) VALUES
(UUID(), '/assets/images/obstacles/asteroide.png'),
