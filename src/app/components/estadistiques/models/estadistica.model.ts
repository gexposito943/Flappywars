import { Usuari } from './usuari.model';

export class Estadistica {
    private _usuari: Usuari;
    private _millor_puntuacio: number;
    private _temps_total_jugat: number;

    constructor() {
        this._usuari = new Usuari();
        this._millor_puntuacio = 0;
        this._temps_total_jugat = 0;
    }

    get usuari(): Usuari { return this._usuari; }
    get millor_puntuacio(): number { return this._millor_puntuacio; }
    get temps_total_jugat(): number { return this._temps_total_jugat; }

    set usuari(value: Usuari) { this._usuari = value; }
    set millor_puntuacio(value: number) { this._millor_puntuacio = value; }
    set temps_total_jugat(value: number) { this._temps_total_jugat = value; }
} 