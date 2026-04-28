// =====================================================================
// termekRoutes.js — A végpontok (route-ok) definíciója
// ---------------------------------------------------------------------
// Ez a fájl köti össze a HTTP útvonalakat (URL + metódus) a Controller
// függvényeivel. Itt ne legyen üzleti logika és SQL — csak az, hogy
// melyik kérés melyik kontroller-metódushoz fusson.
//
// REST végpontok:
//   GET    /api/termekek          -> összes termék listázása
//   GET    /api/termekek/:id      -> egy termék lekérdezése id alapján
//   POST   /api/termekek          -> új termék létrehozása
//   PUT    /api/termekek/:id      -> meglévő termék módosítása
//   DELETE /api/termekek/:id      -> termék törlése
//   POST   /api/termekek/reset    -> alapértelmezett 8 termék visszaállítása
// =====================================================================

const express = require('express');
const TermekController = require('../controllers/termekController');

const router = express.Router();

// FONTOS: a /reset route a /:id elé kerül, hogy ne értelmezze id-nek.
router.post('/reset',  TermekController.reset);

router.get('/',        TermekController.lista);
router.get('/:id',     TermekController.egyetLekerdez);
router.post('/',       TermekController.hozzaad);
router.put('/:id',     TermekController.modosit);
router.delete('/:id',  TermekController.torol);

module.exports = router;
