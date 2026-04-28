// =====================================================================
// AdminTermekek.js — admin oldal: termékek listázása / felvitele / törlése
// ---------------------------------------------------------------------
// Az eredetihez képest a változások:
//   - Az adatbetöltés `init()` metódusba került, mert a Tarolo metódusok
//     mostantól `async`-ok (HTTP hívások a backendhez).
//   - A frissit / hozzaad / torol / reset szintén `async`, és awaitelnek.
//   - A backend a base64-es képet `kep` mezőben fogadja és tárolja.
// =====================================================================

import Tarolo from "./Tarolo.js";

export default class AdminTermekek {
    #lista = [];
    #tablaElem;
    #formElem;
    #nevMezo;
    #arMezo;
    #kategoriaSelect;
    #leirasMezo;
    #kepMezo;
    #kepElonezet;
    #aktualisKep = "";
    #resetGomb;

    constructor() {
        this.#tablaElem       = document.getElementById("termekTabla");
        this.#formElem        = document.getElementById("ujTermekForm");
        this.#nevMezo         = document.getElementById("nevMezo");
        this.#arMezo          = document.getElementById("arMezo");
        this.#kategoriaSelect = document.getElementById("kategoriaSelect");
        this.#leirasMezo      = document.getElementById("leirasMezo");
        this.#kepMezo         = document.getElementById("kepMezo");
        this.#kepElonezet     = document.getElementById("kepElonezet");
        this.#resetGomb       = document.getElementById("resetGomb");

        this.eventhandle();
    }

    // Aszinkron inicializálás — az index.js (illetve admin.js) hívja.
    async init() {
        await this.frissit();
    }

    megjelenit() {
        this.#tablaElem.innerHTML = "";

        if (this.#lista.length === 0) {
            this.#tablaElem.innerHTML =
                `<tr><td colspan="7" class="text-center text-muted">Nincs termék</td></tr>`;
            return;
        }

        for (let i = 0; i < this.#lista.length; i++) {
            const t = this.#lista[i];
            const kepCell = t.kep
                ? `<img src="${t.kep}" alt="${t.nev}" style="width: 60px; height: 60px; object-fit: cover;">`
                : `<span class="text-muted small">nincs</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${t.id}</td>
                <td>${kepCell}</td>
                <td>${t.nev}</td>
                <td>${t.ar} Ft</td>
                <td>${t.kategoria}</td>
                <td>${t.leiras}</td>
                <td>
                    <button class="btn btn-sm btn-danger torol-gomb" data-id="${t.id}">
                        Törlés
                    </button>
                </td>
            `;
            this.#tablaElem.appendChild(tr);
        }

        const torolGombok = document.querySelectorAll(".torol-gomb");
        for (let i = 0; i < torolGombok.length; i++) {
            torolGombok[i].addEventListener("click", async () => {
                const id = parseInt(torolGombok[i].getAttribute("data-id"));
                await this.torol(id);
            });
        }
    }

    async frissit() {
        try {
            this.#lista = await Tarolo.getTermekek();
            this.megjelenit();
        } catch (err) {
            console.error(err);
            this.#tablaElem.innerHTML =
                `<tr><td colspan="7" class="text-center text-danger">Hiba a termékek betöltésénél: ${err.message}</td></tr>`;
        }
    }

    kepBetolt(file) {
        if (!file) {
            this.#aktualisKep = "";
            this.#kepElonezet.innerHTML = "";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Csak képet tölthetsz fel!");
            this.#kepMezo.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxSzeles = 400;
                const arany = img.width > maxSzeles ? maxSzeles / img.width : 1;
                const ujSzeles  = Math.round(img.width  * arany);
                const ujMagas   = Math.round(img.height * arany);

                const canvas = document.createElement("canvas");
                canvas.width  = ujSzeles;
                canvas.height = ujMagas;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, ujSzeles, ujMagas);

                this.#aktualisKep = canvas.toDataURL("image/jpeg", 0.8);
                this.#kepElonezet.innerHTML =
                    `<img src="${this.#aktualisKep}" alt="előnézet" class="img-fluid rounded mt-2" style="max-height: 150px;">`;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    async hozzaad() {
        const nev       = this.#nevMezo.value.trim();
        const ar        = parseInt(this.#arMezo.value);
        const kategoria = this.#kategoriaSelect.value;
        const leiras    = this.#leirasMezo.value.trim();
        const kep       = this.#aktualisKep;

        if (nev === "" || isNaN(ar) || ar <= 0 || leiras === "") {
            alert("Tölts ki minden mezőt érvényes adatokkal!");
            return;
        }

        try {
            await Tarolo.addTermek({ nev, ar, kategoria, leiras, kep });
        } catch (err) {
            alert("Hiba a hozzáadáskor: " + err.message);
            return;
        }

        this.#formElem.reset();
        this.#aktualisKep = "";
        this.#kepElonezet.innerHTML = "";
        await this.frissit();
    }

    async torol(id) {
        if (!confirm("Biztos törlöd ezt a terméket?")) return;
        try {
            await Tarolo.removeTermek(id);
        } catch (err) {
            alert("Hiba a törléskor: " + err.message);
            return;
        }
        await this.frissit();
    }

    eventhandle() {
        this.#formElem.addEventListener("submit", async (e) => {
            e.preventDefault();
            await this.hozzaad();
        });

        this.#kepMezo.addEventListener("change", (e) => {
            this.kepBetolt(e.target.files[0]);
        });

        this.#resetGomb.addEventListener("click", async () => {
            if (!confirm("Visszaállítod az alapértelmezett terméklistát? Ez törli az ÖSSZES jelenlegi terméket!")) return;
            try {
                await Tarolo.reset();
            } catch (err) {
                alert("Hiba a visszaállításkor: " + err.message);
                return;
            }
            await this.frissit();
        });
    }
}
