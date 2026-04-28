export default class KosarItem {
    #termek;
    #darab;

    constructor(termek, darab) {
        this.#termek = termek;
        this.#darab = darab;
    }

    get termek() { return this.#termek; }
    get darab()  { return this.#darab; }

    set darab(ujDarab) {
        this.#darab = ujDarab;
    }

    get totalPrice() {
        return this.#termek.ar * this.#darab;
    }
}
