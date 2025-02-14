
export class Estadistica {
    constructor(
        private _millor_puntuacio: number = 0,
        private _total_partides: number = 0,
        private _temps_total_jugat: number = 0,
        private _punts_totals: number = 0
    ) {}

    // Getters
    get millor_puntuacio(): number { return this._millor_puntuacio; }
    get total_partides(): number { return this._total_partides; }
    get temps_total_jugat(): number { return this._temps_total_jugat; }
    get punts_totals(): number { return this._punts_totals; }

    // Setters
    set millor_puntuacio(value: number) { this._millor_puntuacio = value; }
    set total_partides(value: number) { this._total_partides = value; }
    set temps_total_jugat(value: number) { this._temps_total_jugat = value; }
    set punts_totals(value: number) { this._punts_totals = value; }
} 