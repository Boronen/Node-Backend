// =====================================================================
// Tarolo.js — adatkezelő réteg
// ---------------------------------------------------------------------
// Régen ez a localStorage-be mentett. Most a Node.js + MySQL backendnek
// küld HTTP kéréseket. Az osztály felülete (getTermekek / addTermek /
// removeTermek / reset) megegyezik az eredetivel, viszont MINDEN metódus
// `async` lett — a hívóknak `await`-tel kell hívnia őket.
// =====================================================================

export default class Tarolo {
    // Mivel a frontendet ugyanaz a szerver szolgálja ki, relatív URL elég.
    static #API = "/api/termekek";

    static async getTermekek() {
        const valasz = await fetch(Tarolo.#API);
        if (!valasz.ok) {
            throw new Error(`Lekérdezés sikertelen: ${valasz.status}`);
        }
        return await valasz.json();
    }

    static async addTermek(termek) {
        const valasz = await fetch(Tarolo.#API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(termek)
        });
        if (!valasz.ok) {
            const hiba = await valasz.json().catch(() => ({}));
            throw new Error(hiba.uzenet || `Hozzáadás sikertelen: ${valasz.status}`);
        }
        return await valasz.json();
    }

    static async removeTermek(id) {
        const valasz = await fetch(`${Tarolo.#API}/${id}`, { method: "DELETE" });
        if (!valasz.ok) {
            throw new Error(`Törlés sikertelen: ${valasz.status}`);
        }
    }

    static async reset() {
        const valasz = await fetch(`${Tarolo.#API}/reset`, { method: "POST" });
        if (!valasz.ok) {
            throw new Error(`Visszaállítás sikertelen: ${valasz.status}`);
        }
    }
}
