# 🚀 Projecte

## 📌 Requisits previs

Abans de començar, assegura't de tenir instal·lats els següents programes:

- [Git](https://git-scm.com/downloads) 📂
- [Node.js](https://nodejs.org/) (inclou npm) 🛠️
- [Angular CLI](https://angular.io/cli) ⚡
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) 🗄️
- [Visual Studio Code](https://code.visualstudio.com/) ✨

## 📥 Instal·lació i configuració

### 1️⃣ Clonar el repositori

Obre una terminal i executa:

```sh
cd desktop
git clone https://github.com/gexposito943/Flappywars.git
```

### 2️⃣ Obrir el projecte a Visual Studio Code

Per obrir el projecte en **Visual Studio Code**, executa la següent ordre en la terminal dins del directori del projecte:

```sh
code .
```

Això obrirà automàticament l'editor amb tots els arxius carregats.

### 3️⃣ Instal·lar dependències

```sh
npm install
```

### 4️⃣ Iniciar el backend

```sh
cd backend
npm run dev
```

Si el backend s'ha iniciat correctament, haurien d'aparèixer els següents missatges a la terminal:

```sh
✅ Connexió exitosa a flappywars_db
✅ Connexio a la base de dades correcte

🚀 Servidor iniciat correctament:
   - Port: 3000
   - Mode: development
   - Base de dades: Connectada
   - Assets: naus, nivells, obstacles
```

El servidor backend s'executarà en mode desenvolupament i estarà preparat per rebre peticions.

### 5️⃣ Iniciar el frontend

Obre una nova terminal i executa:

```sh
ng serve
```

Aquest comandament posarà en marxa l'aplicació frontend, que estarà disponible a `http://localhost:4200/`.

### 6️⃣ Configurar la base de dades

1. Obre **MySQL Workbench** 🗄️.
2. Crea una nova base de dades.
3. Copia el fitxer SQL que es troba a la carpeta `database/`.
4. Executa el script SQL a MySQL Workbench per importar la base de dades.

### Configurar l'arxiu .env.
Dins de la carpeta del Backend crearem l'arxiu .env amb les següents dades:
  DB_HOST=el teu host
  DB_USER= el teu usuari
  DB_PASSWORD= la teva contrasenya
  DB_DATABASE= el teu nom de la base de dades

  JWT_SECRET= el teu token.

## ✅ Ús

Un cop completats tots els passos anteriors, el projecte estarà en funcionament i llest per ser utilitzat! 🚀
