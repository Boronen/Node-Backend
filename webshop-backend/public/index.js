// =====================================================================
// index.js — a vásárlói oldal belépési pontja
// ---------------------------------------------------------------------
// Lekéri a backendtől a termékeket, majd átadja őket a Termekek
// osztálynak. Az eredetihez képest a változás: az adatbetöltés
// async, ezért await-tel hívjuk.
// =====================================================================

import Kosar from "./Kosar.js";
import Termekek from "./Termekek.js";
import Tarolo from "./Tarolo.js";

document.addEventListener("DOMContentLoaded", async () => {
    const termekListaElem = document.getElementById("termekLista");

    const kosar = new Kosar();

    try {
        const adatok = await Tarolo.getTermekek();
        new Termekek(termekListaElem, kosar, adatok);
    } catch (err) {
        console.error(err);
        termekListaElem.innerHTML =
            `<p class="text-danger">Hiba a termékek betöltésénél: ${err.message}</p>`;
    }
});
