export default class Termek {
    #obj = {};
    constructor(obj = { id, nev, ar, kategoria, leiras, kep }) {
        this.#obj = obj;
    }

    getObj() {
        return this.#obj;
    }

    get id()        { return this.#obj.id; }
    get nev()       { return this.#obj.nev; }
    get ar()        { return this.#obj.ar; }
    get kategoria() { return this.#obj.kategoria; }
    get leiras()    { return this.#obj.leiras; }
    get kep()       { return this.#obj.kep || ""; }

    megjelenit(szuloElem) {
        const div = document.createElement("div");
        div.className = "col-md-4 mb-4";

        const kepHtml = this.kep
            ? `<img src="${this.kep}" class="card-img-top" alt="${this.#obj.nev}" style="height: 200px; object-fit: cover;">`
            : `<div class="card-img-top bg-secondary d-flex align-items-center justify-content-center text-white" style="height: 200px;">Nincs kép</div>`;

        div.innerHTML = `
            <div class="card h-100 shadow-sm">
                ${kepHtml}
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${this.#obj.nev}</h5>
                    <p class="card-text">${this.#obj.leiras}</p>
                    <p class="card-text fw-bold">${this.#obj.ar} Ft</p>
                    <p class="card-text text-muted small">${this.#obj.kategoria}</p>
                    <button class="btn btn-primary mt-auto kosarba-gomb" data-id="${this.#obj.id}">
                        Kosárba
                    </button>
                </div>
            </div>
        `;
        szuloElem.appendChild(div);
    }
}