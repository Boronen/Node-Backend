// =====================================================================
// termekModell.js — A Modell réteg (M az MVC-ből)
// ---------------------------------------------------------------------
// Ez a fájl FELELŐS minden adatbázis-műveletért, ami a termékekhez
// kapcsolódik. Csak ez a réteg "ismeri" az SQL-t.
//
// Fontos elv: a modell NEM kommunikál HTTP-vel, NEM ad vissza JSON-t,
// NEM ír ki a konzolra felhasználónak szánt üzeneteket. Egyszerűen
// adatokat ad vissza (vagy hibát dob), és kész.
//
// A `?` paraméterhelyek (prepared statement) használata kötelező —
// így védjük az alkalmazást az SQL injection ellen.
// =====================================================================

const pool = require('../config/db');

class TermekModell {

    // Az összes termék lekérdezése.
    static async osszesetLekerdez() {
        const sql = 'SELECT id, nev, ar, kategoria, leiras, kep FROM termekek ORDER BY id ASC';
        const [sorok] = await pool.query(sql);
        return sorok;
    }

    // Egy darab termék lekérdezése azonosító alapján.
    // Visszaadja a terméket vagy `null`-t, ha nincs ilyen.
    static async egyetLekerdez(id) {
        const sql = 'SELECT id, nev, ar, kategoria, leiras, kep FROM termekek WHERE id = ? LIMIT 1';
        const [sorok] = await pool.query(sql, [id]);
        return sorok.length > 0 ? sorok[0] : null;
    }

    // Új termék felvitele. A `termek` egy { nev, ar, kategoria, leiras, kep } objektum.
    // Visszaadja a friss INSERT sor id-jét.
    static async hozzaad(termek) {
        const sql = `
            INSERT INTO termekek (nev, ar, kategoria, leiras, kep)
            VALUES (?, ?, ?, ?, ?)
        `;
        const ertekek = [
            termek.nev,
            termek.ar,
            termek.kategoria,
            termek.leiras,
            termek.kep || null
        ];
        const [eredmeny] = await pool.query(sql, ertekek);
        return eredmeny.insertId;
    }

    // Meglévő termék frissítése azonosító alapján.
    // Visszaadja, hogy hány sor változott (0 = nem volt ilyen termék).
    static async modosit(id, termek) {
        const sql = `
            UPDATE termekek
            SET nev = ?, ar = ?, kategoria = ?, leiras = ?, kep = ?
            WHERE id = ?
        `;
        const ertekek = [
            termek.nev,
            termek.ar,
            termek.kategoria,
            termek.leiras,
            termek.kep || null,
            id
        ];
        const [eredmeny] = await pool.query(sql, ertekek);
        return eredmeny.affectedRows;
    }

    // Termék törlése azonosító alapján.
    // Visszaadja a törölt sorok számát (0 = nem létezett).
    static async torol(id) {
        const sql = 'DELETE FROM termekek WHERE id = ?';
        const [eredmeny] = await pool.query(sql, [id]);
        return eredmeny.affectedRows;
    }
}

module.exports = TermekModell;
