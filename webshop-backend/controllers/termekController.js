// =====================================================================
// termekController.js — A Controller réteg (C az MVC-ből)
// ---------------------------------------------------------------------
// Ez a réteg a HTTP kéréseket kezeli: kiveszi a kérésből a szükséges
// adatokat, validálja őket, meghívja a Modellt, majd a Modell által
// visszaadott eredményt JSON-ben visszaküldi a kliensnek.
//
// Fontos elv: a controller NEM ír SQL-t! Minden adatbázis-művelet
// a Modell felelőssége. A controller csak "összekötő" a HTTP és a
// Modell között + ellenőrzi a bejövő adatokat.
// =====================================================================

const TermekModell = require('../models/termekModell');

// Megengedett kategóriák — a frontend és az adatbázis ENUM is ezt használja.
const ENGEDELYEZETT_KATEGORIAK = ['electronics', 'clothing', 'home'];

// Segédfüggvény: bejövő termék-objektum validálása.
// Visszaad egy hibaüzenetet (string), vagy null-t, ha minden rendben.
function validalTermek(adat) {
    if (!adat || typeof adat !== 'object') {
        return 'Hiányzó vagy érvénytelen kérés-test (request body).';
    }
    if (typeof adat.nev !== 'string' || adat.nev.trim() === '') {
        return 'A "nev" mező kötelező és nem lehet üres.';
    }
    const ar = Number(adat.ar);
    if (!Number.isFinite(ar) || ar <= 0) {
        return 'Az "ar" mezőnek pozitív számnak kell lennie.';
    }
    if (!ENGEDELYEZETT_KATEGORIAK.includes(adat.kategoria)) {
        return `A "kategoria" mező csak ezek egyike lehet: ${ENGEDELYEZETT_KATEGORIAK.join(', ')}.`;
    }
    if (typeof adat.leiras !== 'string' || adat.leiras.trim() === '') {
        return 'A "leiras" mező kötelező és nem lehet üres.';
    }
    if (adat.kep !== undefined && adat.kep !== null && typeof adat.kep !== 'string') {
        return 'A "kep" mező csak szöveg (URL vagy data URL) lehet.';
    }
    return null;
}

class TermekController {

    // GET /api/termekek
    static async lista(req, res) {
        try {
            const termekek = await TermekModell.osszesetLekerdez();
            res.status(200).json(termekek);
        } catch (err) {
            console.error('[lista] Hiba:', err.message);
            res.status(500).json({ uzenet: 'Szerverhiba a termékek lekérdezésekor.' });
        }
    }

    // GET /api/termekek/:id
    static async egyetLekerdez(req, res) {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id) || id <= 0) {
            return res.status(400).json({ uzenet: 'Érvénytelen termék azonosító.' });
        }

        try {
            const termek = await TermekModell.egyetLekerdez(id);
            if (!termek) {
                return res.status(404).json({ uzenet: 'Nincs ilyen azonosítójú termék.' });
            }
            res.status(200).json(termek);
        } catch (err) {
            console.error('[egyetLekerdez] Hiba:', err.message);
            res.status(500).json({ uzenet: 'Szerverhiba a termék lekérdezésekor.' });
        }
    }

    // POST /api/termekek
    static async hozzaad(req, res) {
        const hibauzenet = validalTermek(req.body);
        if (hibauzenet) {
            return res.status(400).json({ uzenet: hibauzenet });
        }

        const ujTermek = {
            nev:       req.body.nev.trim(),
            ar:        Number(req.body.ar),
            kategoria: req.body.kategoria,
            leiras:    req.body.leiras.trim(),
            kep:       req.body.kep || null
        };

        try {
            const ujId = await TermekModell.hozzaad(ujTermek);
            res.status(201).json({ id: ujId, ...ujTermek });
        } catch (err) {
            console.error('[hozzaad] Hiba:', err.message);
            res.status(500).json({ uzenet: 'Szerverhiba a termék hozzáadásakor.' });
        }
    }

    // PUT /api/termekek/:id
    static async modosit(req, res) {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id) || id <= 0) {
            return res.status(400).json({ uzenet: 'Érvénytelen termék azonosító.' });
        }

        const hibauzenet = validalTermek(req.body);
        if (hibauzenet) {
            return res.status(400).json({ uzenet: hibauzenet });
        }

        const modositott = {
            nev:       req.body.nev.trim(),
            ar:        Number(req.body.ar),
            kategoria: req.body.kategoria,
            leiras:    req.body.leiras.trim(),
            kep:       req.body.kep || null
        };

        try {
            const valtozottSorok = await TermekModell.modosit(id, modositott);
            if (valtozottSorok === 0) {
                return res.status(404).json({ uzenet: 'Nincs ilyen azonosítójú termék.' });
            }
            res.status(200).json({ id, ...modositott });
        } catch (err) {
            console.error('[modosit] Hiba:', err.message);
            res.status(500).json({ uzenet: 'Szerverhiba a termék módosításakor.' });
        }
    }

    // DELETE /api/termekek/:id
    static async torol(req, res) {
        const id = parseInt(req.params.id, 10);
        if (Number.isNaN(id) || id <= 0) {
            return res.status(400).json({ uzenet: 'Érvénytelen termék azonosító.' });
        }

        try {
            const valtozottSorok = await TermekModell.torol(id);
            if (valtozottSorok === 0) {
                return res.status(404).json({ uzenet: 'Nincs ilyen azonosítójú termék.' });
            }
            res.status(200).json({ uzenet: 'Termék sikeresen törölve.', id });
        } catch (err) {
            console.error('[torol] Hiba:', err.message);
            res.status(500).json({ uzenet: 'Szerverhiba a termék törlésekor.' });
        }
    }

    // POST /api/termekek/reset — alapértelmezett terméklista visszaállítása
    static async reset(_req, res) {
        try {
            const db = await TermekModell.reset();
            res.status(200).json({ uzenet: 'Alapértelmezett terméklista visszaállítva.', darab: db });
        } catch (err) {
            console.error('[reset] Hiba:', err.message);
            res.status(500).json({ uzenet: 'Szerverhiba a visszaállításkor.' });
        }
    }
}

module.exports = TermekController;
