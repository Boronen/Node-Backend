# Webshop — Node.js + Express + MySQL (XAMPP) — teljes alkalmazás

RESTful backend **és** integrált frontend a [Boronen/webshop_OOP](https://github.com/Boronen/webshop_OOP)
projekt alapján. A frontendet módosítottuk, hogy `localStorage` helyett a Node.js
backendnek küldjön HTTP kéréseket, és ugyanaz az Express szerver szolgálja ki.

---

## Tartalom

1. [Mit tartalmaz a projekt?](#1-mit-tartalmaz-a-projekt)
2. [Mappa-szerkezet](#2-mappa-szerkezet)
3. [Előfeltételek](#3-előfeltételek)
4. [Telepítés és indítás (gyors menet)](#4-telepítés-és-indítás-gyors-menet)
5. [Részletes lépések](#5-részletes-lépések)
6. [Végpontok (API)](#6-végpontok-api)
7. [Hogyan működik az MVC architektúra?](#7-hogyan-működik-az-mvc-architektúra)
8. [Hibakeresés](#8-hibakeresés)

---

## 1. Mit tartalmaz a projekt?

- **Backend** (Node.js + Express + MySQL): RESTful API a termékekhez, MVC felépítésben.
- **Frontend** (HTML + Bootstrap + ES modulok): a vásárlói és az admin felület,
  átírva úgy, hogy `fetch`-csel kommunikál a backenddel.
- **Egyetlen szerver**: az Express egyszerre szolgálja ki a HTML/JS fájlokat
  (`public/` mappa) és a `/api/*` végpontokat. Nincs külön frontend szerver,
  nincs CORS-bonyolítás.

---

## 2. Mappa-szerkezet

```
webshop-backend/
├── config/
│   └── db.js                  # adatbázis-kapcsolat (mysql2 pool)
├── controllers/
│   └── termekController.js    # HTTP kérések kezelése + validáció
├── models/
│   └── termekModell.js        # SQL lekérdezések — csak ez beszél a DB-vel
├── routes/
│   └── termekRoutes.js        # /api/termekek/* végpontok
├── public/                    # ← FRONTEND (statikus fájlok)
│   ├── index.html             # vásárlói oldal
│   ├── admin.html             # admin oldal
│   ├── index.js               # vásárlói oldal belépési pontja
│   ├── admin.js               # admin oldal belépési pontja
│   ├── Tarolo.js              # adatkezelő — fetch()-csel hívja a backendet
│   ├── Termek.js              # egy termék OOP osztály
│   ├── Termekek.js            # terméklista logika (kereső/szűrő)
│   ├── AdminTermekek.js       # admin oldal logika
│   ├── Kosar.js               # kosár logika
│   └── KosarItem.js           # egy kosár-tétel
├── sql/
│   └── webshop.sql            # adatbázis-séma + alap termékek
├── .env.example
├── .gitignore
├── package.json
├── server.js                  # Express alkalmazás (frontend + API egyben)
└── README.md
```

---

## 3. Előfeltételek

- **Node.js 18+** — <https://nodejs.org>
- **XAMPP** (MySQL/MariaDB-vel) — <https://www.apachefriends.org>
- **Modern böngésző** (Chrome, Edge, Firefox)

---

## 4. Telepítés és indítás (gyors menet)

```powershell
# 1) XAMPP-ban indítsd el a MySQL-t.
# 2) phpMyAdmin (http://localhost/phpmyadmin) -> Import -> sql/webshop.sql
# 3) Telepíts és indíts:
cd webshop-backend
npm install
copy .env.example .env       # macOS / Linux: cp .env.example .env
npm start
```

Ha minden OK, a konzolon ezt látod:
```
[db] Sikeres kapcsolódás a(z) "webshop" adatbázishoz.
=================================================
  Webshop fut: http://localhost:3000
  Vásárlói oldal: http://localhost:3000/
  Admin oldal:    http://localhost:3000/admin.html
  Termékek API:   http://localhost:3000/api/termekek
=================================================
```

Nyisd meg böngészőben:
- **Vásárlói oldal:** <http://localhost:3000/>
- **Admin oldal:** <http://localhost:3000/admin.html>

---

## 5. Részletes lépések

### 5.1 Adatbázis létrehozása XAMPP alatt

1. Indítsd el a **XAMPP Control Panel**-t és kattints a **MySQL** sor melletti **Start**-ra.
2. Nyisd meg: <http://localhost/phpmyadmin>
3. Felül **Import** → **Choose File** → válaszd: `sql/webshop.sql` → **Go**.

A script létrehozza a `webshop` adatbázist, a `termekek` táblát és feltölti
8 alap termékkel. Ellenőrzés: bal oldali listában `webshop` → `termekek` → 8 sor.

### 5.2 Backend csomagok telepítése

```powershell
cd webshop-backend
npm install
```

Telepített csomagok:

| csomag | mire való |
|---|---|
| **express** | webszerver-keretrendszer + statikus fájl kiszolgáló |
| **mysql2** | MySQL kliens, async/await támogatással |
| **dotenv** | a `.env` fájl értékeit beolvassa |
| **cors** | CORS header (biztosíték külső hívások esetére) |

### 5.3 `.env` fájl

Másold át a mintát:
```powershell
copy .env.example .env       # Windows
cp .env.example .env         # Linux/Mac
```

Az alapértelmezett értékek megegyeznek a XAMPP-os MySQL-lel:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=webshop
PORT=3000
```

### 5.4 Indítás

```powershell
npm start
# vagy fejlesztéshez (kódváltozásra automatikusan újraindul):
npm run dev
```

---

## 6. Végpontok (API)

| metódus | URL | mit csinál |
|---|---|---|
| GET    | `/api/termekek`         | összes termék |
| GET    | `/api/termekek/:id`     | egy termék |
| POST   | `/api/termekek`         | új termék (body: `{ nev, ar, kategoria, leiras, kep? }`) |
| PUT    | `/api/termekek/:id`     | termék módosítása |
| DELETE | `/api/termekek/:id`     | termék törlése |
| POST   | `/api/termekek/reset`   | alap 8 termék visszaállítása |
| GET    | `/api/healthz`          | „él-e a szerver?” |

### Példák `curl`-lel

```bash
# Összes termék
curl http://localhost:3000/api/termekek

# Új termék
curl -X POST http://localhost:3000/api/termekek ^
  -H "Content-Type: application/json" ^
  -d "{\"nev\":\"Egér\",\"ar\":5500,\"kategoria\":\"electronics\",\"leiras\":\"Vezeték nélküli\"}"

# Termék törlése
curl -X DELETE http://localhost:3000/api/termekek/3

# Alapértelmezett lista visszaállítása
curl -X POST http://localhost:3000/api/termekek/reset
```

---

## 7. Hogyan működik az MVC architektúra?

```
   Böngésző (frontend, public/)
       │     │
       │     └── statikus fájlok (HTML/JS/CSS)
       │
       └── fetch("/api/termekek") ───► Express
                                           │
                                  routes/termekRoutes.js
                                  ┌────────┴────────┐
                                  │   POST /reset   │
                                  │   GET  /        │
                                  │   GET  /:id     │
                                  │   POST /        │
                                  │   PUT  /:id     │
                                  │   DEL  /:id     │
                                  └────────┬────────┘
                                           ▼
                              controllers/termekController.js
                              (validáció, JSON, státuszkód)
                                           │
                                           ▼
                              models/termekModell.js
                              (SQL parancsok prepared statementtel)
                                           │
                                           ▼
                              config/db.js (mysql2 pool)
                                           │
                                           ▼
                                    XAMPP MySQL
```

A három réteg felelőssége:

| Réteg | Tudja-e az SQL-t? | Tudja-e a HTTP-t? |
|---|---|---|
| **Modell** (`termekModell.js`) | ✅ csak ez | ❌ |
| **Controller** (`termekController.js`) | ❌ | ✅ |
| **Route** (`termekRoutes.js`) | ❌ | ✅ (csak térképez) |

A frontend oldalán a `Tarolo.js` az „adatkezelő” réteg — minden HTTP-hívás
csak ezen keresztül megy, így ha holnap másik backendre cserélnénk, csak ezt
a fájlt kellene átírni.

### A frontendnél mi változott az eredeti repóhoz képest?

| fájl | változás |
|---|---|
| `Tarolo.js` | **Teljesen átírva**: `localStorage` helyett `fetch()` a backendhez. Minden metódus `async` lett. |
| `Termekek.js` | A constructor most az adatokat paraméterként kapja, nem ő tölti be (mert nem lehet async). |
| `AdminTermekek.js` | Külön `init()` metódus a betöltéshez; `frissit/hozzaad/torol/reset` mind `async`. |
| `index.js` | Először `await Tarolo.getTermekek()`, aztán létrehozza a `Termekek`-et. |
| `admin.js` | Az `AdminTermekek.init()`-et `await`-tel hívja. |
| `Termek.js`, `Kosar.js`, `KosarItem.js`, `index.html`, `admin.html` | **Változatlan** — a backend bevezetése nem érintette őket. |
| `termeklista.js` | **Eltávolítva** — már nem kell, az adatbázis a forrás. |

---

## 8. Hibakeresés

| Tünet | Megoldás |
|---|---|
| `[db] HIBA: Unknown database 'webshop'` | Importáld a `sql/webshop.sql`-t phpMyAdmin-ban (5.1 lépés). |
| `[db] HIBA: ECONNREFUSED` | A XAMPP-ban a MySQL nem fut. Indítsd el. |
| `[db] HIBA: Access denied` | A `.env` `DB_USER` / `DB_PASSWORD` nem egyezik a MySQL felhasználóval. |
| Az oldal üres / 404 | A backend fut? Próbáld: <http://localhost:3000/api/healthz> |
| `Cannot find module 'express'` | Lefutott-e az `npm install`? A `webshop-backend/` mappában futtasd! |
| Admin: kép feltöltése után „payload too large” | A `server.js`-ben emeld a `limit: '10mb'` értéket. |
| Sehol nem jelennek meg a termékek, az admin sem tölt | Nyisd meg a böngésző DevTools → Console / Network fülét — látod a 4xx/5xx hibákat. |
| PowerShell: `npm.ps1 cannot be loaded` | Egy ablakra: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force` |

---

Készen állsz! 🎉 Egyetlen `npm start` paranccsal fut a teljes webshop:
backend + frontend + adatbázis-kapcsolat.
