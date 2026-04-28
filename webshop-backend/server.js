// =====================================================================
// server.js — Az Express alkalmazás belépési pontja
// ---------------------------------------------------------------------
// Itt állítjuk össze az alkalmazást:
//   1) middleware-ek (CORS, JSON parser, méret-limit)
//   2) statikus fájlok kiszolgálása a /public mappából (frontend)
//   3) route-ok bekötése (termekRoutes)
//   4) hibakezelő middleware
//   5) szerver elindítása a megadott PORT-on
// =====================================================================

const path    = require('path');
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const termekRoutes = require('./routes/termekRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Middleware-ek -----
// CORS: engedélyezzük, hogy a (más porton futó) frontend hívhassa a backendet.
// Mivel a frontendet most ugyanaz a szerver szolgálja ki, ez "csak biztosíték".
app.use(cors());

// JSON kérés-test feldolgozása.
// A limit emelt, mert az admin felület base64-es képeket is küldhet.
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ----- Egyszerű kérés-naplózás (fejlesztéshez) -----
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ----- Statikus fájlok (frontend) -----
// http://localhost:3000/         -> public/index.html (vásárlói oldal)
// http://localhost:3000/admin.html -> public/admin.html (admin oldal)
app.use(express.static(path.join(__dirname, 'public')));

// ----- Egészségellenőrző végpont -----
app.get('/api/healthz', (_req, res) => {
    res.json({ status: 'ok', uzenet: 'A szerver fut.' });
});

// ----- Üzleti route-ok -----
app.use('/api/termekek', termekRoutes);

// ----- 404 kezelő (csak az /api/* végpontokra) -----
app.use('/api', (req, res) => {
    res.status(404).json({ uzenet: `Nincs ilyen végpont: ${req.method} ${req.originalUrl}` });
});

// ----- Általános hibakezelő -----
app.use((err, _req, res, _next) => {
    console.error('[szerver-hiba]', err);
    res.status(500).json({ uzenet: 'Váratlan szerverhiba történt.' });
});

// ----- Szerver indítása -----
app.listen(PORT, () => {
    console.log('=================================================');
    console.log(`  Webshop fut: http://localhost:${PORT}`);
    console.log(`  Vásárlói oldal: http://localhost:${PORT}/`);
    console.log(`  Admin oldal:    http://localhost:${PORT}/admin.html`);
    console.log(`  Termékek API:   http://localhost:${PORT}/api/termekek`);
    console.log('=================================================');
});
