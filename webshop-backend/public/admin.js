// =====================================================================
// admin.js — az admin oldal belépési pontja
// ---------------------------------------------------------------------
// A változás az eredetihez képest: az AdminTermekek.init() metódust
// `await`-tel meghívjuk, mert az adatokat HTTP-n keresztül tölti be.
// =====================================================================

import AdminTermekek from "./AdminTermekek.js";

document.addEventListener("DOMContentLoaded", async () => {
    const admin = new AdminTermekek();
    await admin.init();
});
