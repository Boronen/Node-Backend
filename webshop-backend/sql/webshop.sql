-- =====================================================================
-- Webshop adatbázis létrehozó script (XAMPP / phpMyAdmin alá)
-- Használat:
--   1) Indítsd el a XAMPP-ban a MySQL/MariaDB szolgáltatást.
--   2) Nyisd meg a phpMyAdmin-t (http://localhost/phpmyadmin).
--   3) Az "Import" fülön töltsd be ezt a fájlt, vagy másold be a
--      tartalmát az "SQL" fülre és futtasd le.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS webshop
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE webshop;

-- ----------------------------------------------------------
-- Termékek tábla
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS termekek (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nev        VARCHAR(150)   NOT NULL,
    ar         INT            NOT NULL,
    kategoria  ENUM('electronics', 'clothing', 'home') NOT NULL,
    leiras     TEXT           NOT NULL,
    kep        LONGTEXT       NULL,
    letrehozva TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Alap termékek (a frontend eredeti termeklista.js tartalma)
-- ----------------------------------------------------------
INSERT INTO termekek (nev, ar, kategoria, leiras, kep) VALUES
('Laptop',        200000, 'electronics', 'HP Pavilion 15, 8GB RAM, 256GB SSD', 'https://placehold.co/400x300?text=Laptop'),
('Telefon',       150000, 'electronics', 'Samsung Galaxy S23, 128GB',          'https://placehold.co/400x300?text=Telefon'),
('Póló',            5000, 'clothing',    'Fehér póló, 100% pamut',             'https://placehold.co/400x300?text=Polo'),
('Zokni',           1000, 'clothing',    'Kék zokni, 80% pamut',               'https://placehold.co/400x300?text=Zokni'),
('Tál',             2000, 'home',        'Porcelán tál, fehér',                'https://placehold.co/400x300?text=Tal'),
('Vízkeverő',       3000, 'home',        'Stainless steel vízkeverő',          'https://placehold.co/400x300?text=Vizkevero'),
('Monitor',        80000, 'electronics', 'Dell 24", Full HD',                  'https://placehold.co/400x300?text=Monitor'),
('Szakácsöltöny',  10000, 'home',        'Fehér szakácsöltöny, M méret',       'https://placehold.co/400x300?text=Szakacs');
