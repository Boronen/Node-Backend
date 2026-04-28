# Webshop Backend — Node.js + Express + MySQL (XAMPP)

RESTful backend a [Boronen/webshop_OOP](https://github.com/Boronen/webshop_OOP) frontendhez.
A projekt szigorúan az **MVC** (Model–View–Controller) elveket követi, hogy a kód
karbantartható és könnyen érthető legyen.

---

## Tartalomjegyzék

1. [Mit készítünk és miért?](#1-mit-készítünk-és-miért)
2. [Mappa- és fájlszerkezet](#2-mappa--és-fájlszerkezet)
3. [Előfeltételek](#3-előfeltételek)
4. [Lépésről lépésre](#4-lépésről-lépésre)
   - [4.1 Adatbázis létrehozása XAMPP alatt](#41-adatbázis-létrehozása-xampp-alatt)
   - [4.2 Csomagok telepítése](#42-csomagok-telepítése)
   - [4.3 .env fájl beállítása](#43-env-fájl-beállítása)
   - [4.4 db.js — kapcsolódás az adatbázishoz](#44-dbjs--kapcsolódás-az-adatbázishoz)
   - [4.5 termekModell.js — Modell réteg (SQL)](#45-termekmodelljs--modell-réteg-sql)
   - [4.6 termekController.js — Controller réteg](#46-termekcontrollerjs--controller-réteg)
   - [4.7 termekRoutes.js — Route-ok](#47-termekroutesjs--route-ok)
   - [4.8 server.js — Express alkalmazás összerakása](#48-serverjs--express-alkalmazás-összerakása)
5. [A szerver indítása](#5-a-szerver-indítása)
6. [Végpontok és tesztelés](#6-végpontok-és-tesztelés)
7. [A frontend csatlakoztatása](#7-a-frontend-csatlakoztatása)
8. [Hibakeresés (FAQ)](#8-hibakeresés-faq)

---

## 1. Mit készítünk és miért?

A frontend (a hivatkozott GitHub repo) jelenleg a böngésző `localStorage`-ában tárolja
a termékeket. Ez egy egyszerű prototípushoz jó, de **nem alkalmas** valós webáruházhoz,
mert minden böngésző külön „másolatot” lát, és nem osztozik az adatokon.

Megoldás: készítünk egy **kiszolgálót (backend)**, ami:

- a XAMPP-pal futó **MySQL** adatbázisban tárolja a termékeket,
- HTTP kéréseken keresztül kiszolgálja a frontendet (REST API),
- **JSON** formátumban küldi vissza az adatokat.

Az **MVC** elvet azért használjuk, mert így minden „rétegnek” pontosan egy feladata van:

| Réteg | Felelőssége | Tudja-e az SQL-t? | Tudja-e a HTTP-t? |
|-------|-------------|-------------------|-------------------|
| **Modell** (`termekModell.js`) | Adatbázis-műveletek | igen | nem |
| **Controller** (`termekController.js`) | HTTP kérés feldolgozása, validáció | nem | igen |
| **Route** (`termekRoutes.js`) | URL ↔ controller-függvény hozzárendelés | nem | igen |

Ez azért fontos, mert ha holnap váltanánk pl. PostgreSQL-re, csak a Modellt
kellene újraírni — a többi maradhatna.

---

## 2. Mappa- és fájlszerkezet

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
├── sql/
│   └── webshop.sql            # adatbázis-séma + alap termékek
├── .env.example               # példa környezeti változók
├── .gitignore
├── package.json
├── server.js                  # Express belépési pont
└── README.md
```

---

## 3. Előfeltételek

Az alábbi szoftvereknek telepítve kell lenniük a gépeden:

- **Node.js 18+** — letöltés: <https://nodejs.org>
- **XAMPP** (MySQL/MariaDB-vel) — letöltés: <https://www.apachefriends.org>
- Tetszőleges szerkesztő (pl. VS Code)
- Tetszőleges API-tesztelő (pl. **Postman**, **Insomnia**, vagy `curl`)

A node verziódat így ellenőrizheted:
```bash
node -v
```

---

## 4. Lépésről lépésre

### 4.1 Adatbázis létrehozása XAMPP alatt

1. Indítsd el a **XAMPP Control Panel**-t.
2. Kattints a **Start** gombra a **MySQL** (vagy MariaDB) sor mellett.
3. Nyisd meg a böngészőben: <http://localhost/phpmyadmin>.
4. A bal oldali menüben kattints az **Import** fülre.
5. Tallózd be a `sql/webshop.sql` fájlt, majd kattints a **Go / Importálás** gombra.

A script automatikusan:
- létrehozza a `webshop` adatbázist (ha még nincs),
- létrehozza a `termekek` táblát,
- feltölti 8 alap termékkel (a frontend eredeti `termeklista.js`-éből).

> **Gyors ellenőrzés:** kattints bal oldalt a `webshop` → `termekek` táblára.
> Látnod kell a 8 sort.

A `termekek` tábla szerkezete:

| oszlop | típus | megjegyzés |
|--------|-------|------------|
| `id` | INT, PRIMARY KEY, AUTO_INCREMENT | egyedi azonosító |
| `nev` | VARCHAR(150) | termék neve |
| `ar` | INT | ár forintban |
| `kategoria` | ENUM('electronics','clothing','home') | kategória — csak ez a 3 lehet |
| `leiras` | TEXT | hosszabb leírás |
| `kep` | LONGTEXT | URL **vagy** base64 data URL |
| `letrehozva` | TIMESTAMP | automatikusan kitöltődik |

---

### 4.2 Csomagok telepítése

Lépj be a backend mappájába és telepítsd a függőségeket:

```bash
cd webshop-backend
npm install
```

A `package.json`-ban négy csomag van:

| csomag | mire való? |
|--------|-----------|
| **express** | a webszerver-keretrendszer (route-ok, middleware-ek) |
| **mysql2** | MySQL kliens, **promise** (async/await) támogatással |
| **dotenv** | a `.env` fájl változóit beolvassa a `process.env`-be |
| **cors** | engedélyezi, hogy a frontend (másik portról) hívja a backendet |

---

### 4.3 .env fájl beállítása

A `.env.example` egy minta. Másold át `.env` néven, és ha kell, írd át az értékeket
(alapból a XAMPP-os MySQL `root` user, üres jelszóval — pont ilyen):

```bash
cp .env.example .env       # macOS / Linux
copy .env.example .env     # Windows (PowerShell)
```

A fájl tartalma:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=webshop

PORT=3000
```

> **Miért külön fájlban?** Mert a `.env` jelszót, kulcsot is tartalmazhat,
> és ezt **nem** szabad git-be feltölteni (már bent van a `.gitignore`-ban).

---

### 4.4 `db.js` — kapcsolódás az adatbázishoz

Fájl: `config/db.js`

**Mit csinál?**
- Létrehoz egy **connection pool**-t a MySQL-hez. A pool olyan, mint egy csomag
  előkészített kapcsolat: ha a controller kérdez, kap egy szabadot, és visszaadja
  használat után. Sokkal gyorsabb, mint minden kéréshez új kapcsolatot nyitni.
- A `mysql2/promise` változatot használjuk, hogy `async/await`-tel dolgozhassunk.
- Az értékeket a `.env`-ből veszi.
- Indításkor lefuttat egy gyors tesztet: ha nem sikerül kapcsolódni, kiír egy
  beszédes hibaüzenetet.

A pool-t `module.exports = pool` szóval „kiajándékozzuk”, hogy a Modell réteg
tudja `require`-rel beimportálni.

---

### 4.5 `termekModell.js` — Modell réteg (SQL)

Fájl: `models/termekModell.js`

**Mit csinál?** Itt van **az összes** SQL parancs. Más fájl nem ír SQL-t.

A `TermekModell` osztály statikus metódusai:

| metódus | mit csinál |
|---------|------------|
| `osszesetLekerdez()` | `SELECT ... FROM termekek` — minden termék |
| `egyetLekerdez(id)` | `SELECT ... WHERE id = ?` — egy termék vagy `null` |
| `hozzaad(termek)` | `INSERT INTO termekek ...` — új sor, visszaadja az új `id`-t |
| `modosit(id, termek)` | `UPDATE termekek SET ... WHERE id = ?` |
| `torol(id)` | `DELETE FROM termekek WHERE id = ?` |

**Miért `?` paraméterhelyek?** A `pool.query(sql, [értékek])` ún. **prepared
statement**-et használ. Ez **megvédi** az alkalmazást az **SQL injection**
támadások ellen. Soha ne fűzd össze sztringgel a felhasználói adatot az SQL-be!

Rossz (sebezhető):
```js
pool.query(`SELECT * FROM termekek WHERE id = ${req.params.id}`); // ❌
```
Jó (biztonságos):
```js
pool.query('SELECT * FROM termekek WHERE id = ?', [req.params.id]); // ✅
```

---

### 4.6 `termekController.js` — Controller réteg

Fájl: `controllers/termekController.js`

**Mit csinál?**
1. Kiveszi a kérésből a szükséges adatokat (`req.params`, `req.body`).
2. **Validál**: ellenőrzi, hogy a bejövő adatok megfelelőek-e
   (név nem üres, ár pozitív szám, kategória a megengedett 3 közül stb.).
3. Meghívja a megfelelő **Modell-metódust**.
4. A választ **JSON**-ben visszaküldi a megfelelő HTTP státuszkóddal.
5. Ha hiba van, **try/catch**-csel elkapja és ad egy értelmes választ.

HTTP státuszkódok, amiket használunk:

| kód | mikor |
|-----|------|
| **200 OK** | sikeres lekérdezés / módosítás / törlés |
| **201 Created** | sikeres `POST` (új termék létrejött) |
| **400 Bad Request** | a kérés hibás (pl. hiányzó mező, érvénytelen `id`) |
| **404 Not Found** | nincs ilyen termék / nincs ilyen végpont |
| **500 Internal Server Error** | szerveroldali hiba (pl. DB nem elérhető) |

**Példa — `lista` metódus:**
```js
static async lista(req, res) {
    try {
        const termekek = await TermekModell.osszesetLekerdez();
        res.status(200).json(termekek);
    } catch (err) {
        res.status(500).json({ uzenet: 'Szerverhiba a termékek lekérdezésekor.' });
    }
}
```
Figyeld meg: itt **nincs** SQL. Csak a Modellt hívjuk, és JSON-ban válaszolunk.

---

### 4.7 `termekRoutes.js` — Route-ok

Fájl: `routes/termekRoutes.js`

**Mit csinál?** Egy tiszta „térképet” ad arról, hogy melyik **HTTP metódus + URL**
melyik controller-függvényhez tartozik. Logika **ide nem kerül**.

```js
router.get('/',       TermekController.lista);
router.get('/:id',    TermekController.egyetLekerdez);
router.post('/',      TermekController.hozzaad);
router.put('/:id',    TermekController.modosit);
router.delete('/:id', TermekController.torol);
```

A `server.js`-ben ezt a router-t a `/api/termekek` előtag alá kapcsoljuk be,
így a fenti `/` valójában `/api/termekek` lesz, a `/:id` pedig `/api/termekek/:id`.

---

### 4.8 `server.js` — Express alkalmazás összerakása

Fájl: `server.js`

**Mit csinál?** Itt rakjuk össze az alkalmazást:

1. **`express.json()`** — a bejövő JSON kérés-testet `req.body`-ba alakítja.
   A `limit: '10mb'` azért kell, mert az admin felület base64 képet is küld.
2. **`cors()`** — engedélyezi a böngészőnek, hogy más portról (pl. `5500`-ról
   futó frontendről) hívja a backendet.
3. **Naplózó middleware** — minden kérést kiír a konzolra (fejlesztéshez hasznos).
4. **`/api/healthz`** — egyszerű „él vagy?” végpont.
5. **`app.use('/api/termekek', termekRoutes)`** — bekötjük a termékek route-ját.
6. **404 kezelő** — ha senki nem találta el a kérést.
7. **Általános hibakezelő** — váratlan hibákra ad egy tisztességes választ.
8. **`app.listen(PORT, ...)`** — elindítja a szervert.

---

## 5. A szerver indítása

```bash
# Egyszer telepíteni:
npm install

# Indítás:
npm start
# vagy fejlesztéshez (automatikus újraindítással):
npm run dev
```

Sikeres indítás esetén ezt látod:

```
[db] Sikeres kapcsolódás a(z) "webshop" adatbázishoz.
=================================================
  Webshop backend fut: http://localhost:3000
  Termékek végpont:    http://localhost:3000/api/termekek
=================================================
```

---

## 6. Végpontok és tesztelés

| metódus | URL | leírás | kérés-test |
|---------|-----|--------|-----------|
| GET    | `/api/termekek`     | összes termék listája       | — |
| GET    | `/api/termekek/:id` | egy termék lekérdezése      | — |
| POST   | `/api/termekek`     | új termék felvitele         | `{ nev, ar, kategoria, leiras, kep? }` |
| PUT    | `/api/termekek/:id` | meglévő termék módosítása   | `{ nev, ar, kategoria, leiras, kep? }` |
| DELETE | `/api/termekek/:id` | termék törlése              | — |
| GET    | `/api/healthz`      | szerver-egészség ellenőrző  | — |

### Példák `curl`-lel

**Összes termék listázása:**
```bash
curl http://localhost:3000/api/termekek
```

**Egy termék lekérdezése:**
```bash
curl http://localhost:3000/api/termekek/1
```

**Új termék hozzáadása:**
```bash
curl -X POST http://localhost:3000/api/termekek \
  -H "Content-Type: application/json" \
  -d '{
    "nev": "Egér",
    "ar": 5500,
    "kategoria": "electronics",
    "leiras": "Vezeték nélküli optikai egér",
    "kep": "https://placehold.co/400x300?text=Eger"
  }'
```

**Termék módosítása:**
```bash
curl -X PUT http://localhost:3000/api/termekek/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nev": "Laptop (új)",
    "ar": 220000,
    "kategoria": "electronics",
    "leiras": "HP Pavilion 15, 16GB RAM, 512GB SSD",
    "kep": ""
  }'
```

**Termék törlése:**
```bash
curl -X DELETE http://localhost:3000/api/termekek/3
```

---

## 7. A frontend csatlakoztatása

Az eredeti frontend (`Tarolo.js`) jelenleg `localStorage`-ot használ.
Ahhoz, hogy a backendet használja, a `Tarolo` osztály metódusait
le kell cserélni HTTP-hívásokra (`fetch`). Példa:

```js
// Tarolo.js — új változat
export default class Tarolo {
    static #API = "http://localhost:3000/api/termekek";

    static async getTermekek() {
        const valasz = await fetch(Tarolo.#API);
        return await valasz.json();
    }

    static async addTermek(termek) {
        const valasz = await fetch(Tarolo.#API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(termek)
        });
        return await valasz.json();
    }

    static async removeTermek(id) {
        await fetch(`${Tarolo.#API}/${id}`, { method: "DELETE" });
    }
}
```

> Mivel a metódusok `async`-ká válnak, a hívó osztályokban
> (`Termekek`, `AdminTermekek`) `await`-tel kell hívni őket.
> Ez már a frontend feladata, nem ennek a backendnek.

---

## 8. Hibakeresés (FAQ)

**„`[db] HIBA: nem sikerült kapcsolódni`” az indításkor.**
- Fut-e a XAMPP-ban a MySQL? Nézd meg a Control Panelben.
- A `.env` `DB_USER` és `DB_PASSWORD` egyezik-e a XAMPP-éval?
  (Alapból `root` és üres jelszó.)
- Létezik-e a `webshop` adatbázis? (Lásd 4.1 lépés.)

**„CORS error” a böngésző konzolban.**
- A `server.js`-ben a `cors()` engedélyez minden originst.
  Ha le akarod szűkíteni, írd: `cors({ origin: 'http://localhost:5500' })`.

**„Cannot find module 'express'”.**
- Elfelejtetted lefuttatni az `npm install`-t a `webshop-backend`
  mappában.

**A POST/PUT 400-as „A nev mező kötelező…” hibát ad.**
- A kérésnek `Content-Type: application/json` fejlécet kell tartalmaznia,
  és a JSON-nak érvényesnek kell lennie. Postmanben válaszd a **Body → raw → JSON** lehetőséget.

**„payload too large” hiba kép feltöltésnél.**
- A `server.js`-ben emeld a `limit: '10mb'` értéket nagyobbra (pl. `'20mb'`).

---

Készen állsz! Miután a fenti lépéseket végigjártad, egy futó RESTful Node.js
backended van, ami a XAMPP-os MySQL adatbázisból szolgálja ki a webshop
frontendjét.
