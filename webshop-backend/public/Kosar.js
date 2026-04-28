import KosarItem from "./KosarItem.js";

export default class Kosar {
    #items = [];
    #kosarElem;
    #osszegElem;

    constructor() {
        this.#kosarElem  = document.getElementById("kosarItems");
        this.#osszegElem = document.getElementById("osszesen");
        this.frissit();
    }

    getItems() {
        return this.#items;
    }

    addItem(termek) {
        let letezo = null;
        for (let i = 0; i < this.#items.length; i++) {
            if (this.#items[i].termek.id === termek.id) {
                letezo = this.#items[i];
                break;
            }
        }
        if (letezo) {
            letezo.darab = letezo.darab + 1;
        } else {
            this.#items.push(new KosarItem(termek, 1));
        }
        this.frissit();
    }

    removeItem(termekId) {
        const ujLista = [];
        for (let i = 0; i < this.#items.length; i++) {
            if (this.#items[i].termek.id !== termekId) {
                ujLista.push(this.#items[i]);
            }
        }
        this.#items = ujLista;
        this.frissit();
    }

    updateQuantity(termekId, ujDarab) {
        for (let i = 0; i < this.#items.length; i++) {
            if (this.#items[i].termek.id === termekId) {
                if (ujDarab <= 0) {
                    this.removeItem(termekId);
                } else {
                    this.#items[i].darab = ujDarab;
                    this.frissit();
                }
                return;
            }
        }
    }

    get totalPrice() {
        let osszeg = 0;
        for (let i = 0; i < this.#items.length; i++) {
            osszeg += this.#items[i].totalPrice;
        }
        return osszeg;
    }

megjelenit() {
    this.#kosarElem.innerHTML = "";

    if (this.#items.length === 0) {
        this.#kosarElem.innerHTML =
            `<p class="text-center mb-0">A kosár üres</p>`;
        return;
    }

    for (let i = 0; i < this.#items.length; i++) {
        const item = this.#items[i];
        const sor = document.createElement("div");
        sor.className =
            "d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom";

        const kepHtml = item.termek.kep
            ? `<img src="${item.termek.kep}" alt="${item.termek.nev}" style="width: 40px; height: 40px; object-fit: cover;" class="me-2 rounded">`
            : "";

        sor.innerHTML = `
            <div class="d-flex align-items-center">
                ${kepHtml}
                <div>
                    <h6 class="mb-0">${item.termek.nev}</h6>
                    <small class="text-muted">${item.termek.ar} Ft x ${item.darab}</small>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary csokkent"
                        data-id="${item.termek.id}">-</button>
                <span class="mx-2">${item.darab}</span>
                <button class="btn btn-sm btn-outline-secondary novel"
                        data-id="${item.termek.id}">+</button>
                <button class="btn btn-sm btn-danger ms-2 torol"
                        data-id="${item.termek.id}">Töröl</button>
            </div>
        `;
        this.#kosarElem.appendChild(sor);
    }
}

    frissit() {
        this.megjelenit();
        this.#osszegElem.textContent = this.totalPrice;
        this.eventhandle();
    }

    eventhandle() {
        const csokkentGombok = document.querySelectorAll(".csokkent");
        for (let i = 0; i < csokkentGombok.length; i++) {
            csokkentGombok[i].addEventListener("click", () => {
                const id = parseInt(csokkentGombok[i].getAttribute("data-id"));
                for (let j = 0; j < this.#items.length; j++) {
                    if (this.#items[j].termek.id === id) {
                        this.updateQuantity(id, this.#items[j].darab - 1);
                        break;
                    }
                }
            });
        }

        const novelGombok = document.querySelectorAll(".novel");
        for (let i = 0; i < novelGombok.length; i++) {
            novelGombok[i].addEventListener("click", () => {
                const id = parseInt(novelGombok[i].getAttribute("data-id"));
                for (let j = 0; j < this.#items.length; j++) {
                    if (this.#items[j].termek.id === id) {
                        this.updateQuantity(id, this.#items[j].darab + 1);
                        break;
                    }
                }
            });
        }

        const torolGombok = document.querySelectorAll(".torol");
        for (let i = 0; i < torolGombok.length; i++) {
            torolGombok[i].addEventListener("click", () => {
                const id = parseInt(torolGombok[i].getAttribute("data-id"));
                this.removeItem(id);
            });
        }
    }
}
