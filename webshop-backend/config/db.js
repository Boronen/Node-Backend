// =====================================================================
// db.js — Adatbázis kapcsolódás (MySQL / MariaDB, XAMPP)
// ---------------------------------------------------------------------
// Itt hozzuk létre a "kapcsolat-csomagolót" (connection pool), amit
// majd a Modell rétegben használunk SQL lekérdezésekhez.
//
// Miért pool és nem egyszerű connection?
//   - A pool több párhuzamos kapcsolatot tud kezelni, gyorsabb és
//     biztonságosabb webes környezetben.
//   - A `mysql2/promise` változat lehetővé teszi az async/await
//     használatát, így olvashatóbb a kód.
//
// Az érzékeny adatokat (jelszó, host) a .env fájlból olvassuk be,
// hogy ne kerüljenek be a kódba (lásd .env.example).
// =====================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'webshop',

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Indításkor egy gyors teszt: működik-e a kapcsolat?
// Ha nem, hasznos hibaüzenetet adunk a fejlesztőnek.
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log(`[db] Sikeres kapcsolódás a(z) "${process.env.DB_NAME || 'webshop'}" adatbázishoz.`);
        conn.release();
    } catch (err) {
        console.error('[db] HIBA: nem sikerült kapcsolódni az adatbázishoz!');
        console.error('     Ellenőrizd, hogy fut-e a MySQL a XAMPP-ban,');
        console.error('     és helyesek-e a .env fájl értékei.');
        console.error('     Részletek:', err.message);
    }
})();

module.exports = pool;
