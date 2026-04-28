// =====================================================================
// server.js — Az Express alkalmazás belépési pontja
// ---------------------------------------------------------------------
// Itt állítjuk össze az alkalmazást:
//   1) middleware-ek (CORS, JSON parser, méret-limit)
//   2) route-ok bekötése (termekRoutes)
//   3) hibakezelő middleware
//   4) szerver elindítása a megadott PORT-on
// =====================================================================

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const termekRoutes = require('./routes/termekRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Middleware-ek -----
// CORS: engedélyezzük, hogy a (más porton futó) frontend hívhassa a backendet.
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

// ----- Egészségellenőrző végpont -----
app.get('/api/healthz', (_req, res) => {
    res.json({ status: 'ok', uzenet: 'A szerver fut.' });
});

// ----- Üzleti route-ok -----
app.use('/api/termekek', termekRoutes);

// ----- 404 kezelő -----
app.use((req, res) => {
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
    console.log(`  Webshop backend fut: http://localhost:${PORT}`);
    console.log(`  Termékek végpont:    http://localhost:${PORT}/api/termekek`);
    console.log('=================================================');
});
