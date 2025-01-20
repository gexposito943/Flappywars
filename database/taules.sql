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
-- 3. CRUD amb Relació 1:N (Un usuari pot tenir moltes partides)
-- Registra cada partida jugada i les seves estadístiques
CREATE TABLE partides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuari_id INT NOT NULL,
    puntuacio INT NOT NULL DEFAULT 0,
    duracio_segons INT NOT NULL,
    nau_utilitzada INT NOT NULL,
    nivell_dificultat ENUM('facil', 'mitja', 'dificil') DEFAULT 'facil',
    data_partida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    obstacles_superats INT DEFAULT 0,
    completada BOOLEAN DEFAULT true,
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id),
    FOREIGN KEY (nau_utilitzada) REFERENCES naus(id)
);
-- 4. CRUD amb Relació N:M (Usuaris i Assoliments)
-- Sistema d'assoliments del joc
CREATE TABLE assoliments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    descripcio TEXT,
    imatge_url VARCHAR(255),
    punts_requerits INT NOT NULL,
    tipus ENUM('distancia', 'punts', 'temps') NOT NULL,
    data_creacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Taula intermitja per la relació N:M entre usuaris i assoliments
CREATE TABLE usuaris_assoliments (
    usuari_id INT,
    assoliment_id INT,
    data_obtencio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuari_id, assoliment_id),
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id),
    FOREIGN KEY (assoliment_id) REFERENCES assoliments(id)
);
-- Taula d'estadístiques
-- Resum d'estadístiques per consulta ràpida
CREATE TABLE estadistiques_usuari (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuari_id INT NOT NULL,
    millor_puntuacio INT DEFAULT 0,
    total_partides INT DEFAULT 0,
    temps_total_jugat INT DEFAULT 0,
    data_actualitzacio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id)
);

-- Inserts bàsics de naus
INSERT INTO naus (nom, velocitat, descripcio, imatge_url, disponible) VALUES
('X-Wing', 1, 'Nau inicial perfecta per començar', '/assets/images/naus/x-wing.png', true),
('TIE Fighter', 2, 'Nau ràpida de l''Imperi', '/assets/images/naus/tie-fighter.png', false),
('Millennium Falcon', 3, 'La nau més ràpida', '/assets/images/naus/millennium-falcon.png', false);