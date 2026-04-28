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

    // Az ÖSSZES termék törlése + az alap 8 termék visszaállítása.
    // Tranzakcióban fut, hogy ne maradjon félig törölt állapotban.
    static async reset() {
        const alapTermekek = [
            ['Laptop',        200000, 'electronics', 'HP Pavilion 15, 8GB RAM, 256GB SSD', 'https://placehold.co/400x300?text=Laptop'],
            ['Telefon',       150000, 'electronics', 'Samsung Galaxy S23, 128GB',          'https://placehold.co/400x300?text=Telefon'],
            ['Póló',            5000, 'clothing',    'Fehér póló, 100% pamut',             'https://placehold.co/400x300?text=Polo'],
            ['Zokni',           1000, 'clothing',    'Kék zokni, 80% pamut',               'https://placehold.co/400x300?text=Zokni'],
            ['Tál',             2000, 'home',        'Porcelán tál, fehér',                'https://placehold.co/400x300?text=Tal'],
            ['Vízkeverő',       3000, 'home',        'Stainless steel vízkeverő',          'https://placehold.co/400x300?text=Vizkevero'],
            ['Monitor',        80000, 'electronics', 'Dell 24", Full HD',                  'https://placehold.co/400x300?text=Monitor'],
            ['Szakácsöltöny',  10000, 'home',        'Fehér szakácsöltöny, M méret',       'https://placehold.co/400x300?text=Szakacs']
        ];

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            await conn.query('DELETE FROM termekek');
            await conn.query('ALTER TABLE termekek AUTO_INCREMENT = 1');

            const insertSql = `
                INSERT INTO termekek (nev, ar, kategoria, leiras, kep)
                VALUES (?, ?, ?, ?, ?)
            `;
            for (const sor of alapTermekek) {
                await conn.query(insertSql, sor);
            }

            await conn.commit();
            return alapTermekek.length;
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
}

module.exports = TermekModell;
