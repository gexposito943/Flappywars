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