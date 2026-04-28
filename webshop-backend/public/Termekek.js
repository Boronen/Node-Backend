// =====================================================================
// Termekek.js — terméklista a vásárlói oldalon
// ---------------------------------------------------------------------
// Az eredetihez képest egyetlen érdemi változás: a constructor most
// készen kapja a termék-adatokat (tömbként), nem ő tölti be őket
// Tarolo-ból. Ezt azért, mert a Tarolo.getTermekek() most már `async`,
// és egy constructor nem lehet async. A betöltést az index.js intézi
// és átadja az adatokat ide.
// =====================================================================

import Termek from "./Termek.js";

export default class Termekek {
  #lista = [];
  #kosar;
  #szuloElem;
  #keresoMezo;
  #keresoGomb;
  #szuroSelect;

  constructor(szuloElem, kosar, adatok) {
    this.#szuloElem = szuloElem;
    this.#kosar = kosar;

    for (let i = 0; i < adatok.length; i++) {
      this.#lista.push(new Termek(adatok[i]));
    }

    this.#keresoMezo = document.getElementById("keresoMezo");
    this.#keresoGomb = document.getElementById("keresoGomb");
    this.#szuroSelect = document.getElementById("szuroSelect");

    this.megjelenit(this.#lista);
    this.eventhandle();
  }

  getLista() {
    return this.#lista;
  }

  megjelenit(lista) {
    this.#szuloElem.innerHTML = "";

    if (lista.length === 0) {
      this.#szuloElem.innerHTML = `<p class="text-center text-muted">Nincs találat.</p>`;
      return;
    }

    for (let i = 0; i < lista.length; i++) {
      lista[i].megjelenit(this.#szuloElem);
    }

    const gombok = document.querySelectorAll(".kosarba-gomb");
    for (let i = 0; i < gombok.length; i++) {
      gombok[i].addEventListener("click", () => {
        const id = parseInt(gombok[i].getAttribute("data-id"));
        for (let j = 0; j < this.#lista.length; j++) {
          if (this.#lista[j].id === id) {
            this.#kosar.addItem(this.#lista[j]);
            break;
          }
        }
      });
    }
  }

  frissit() {
    const kereses = this.#keresoMezo.value.toLowerCase();
    const szuro = this.#szuroSelect.value;
    const szurtek = [];

    for (let i = 0; i < this.#lista.length; i++) {
      const t = this.#lista[i];
      const nevTalalat = t.nev.toLowerCase().includes(kereses);
      const kategoriaTalalat = szuro === "all" || t.kategoria === szuro;
      if (nevTalalat && kategoriaTalalat) {
        szurtek.push(t);
      }
    }

    this.megjelenit(szurtek);
  }

  eventhandle() {
    this.#keresoGomb.addEventListener("click", () => this.frissit());
    this.#keresoMezo.addEventListener("keyup", (e) => {
      if (e.key === "Enter") this.frissit();
    });
    this.#szuroSelect.addEventListener("change", () => this.frissit());
  }
}
