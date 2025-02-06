export class Usuari {
    private _id: string;
    private _nom_usuari: string;
    private _punts_totals: number;
    private _estat: string;

    constructor() {
        this._id = '';
        this._nom_usuari = '';
        this._punts_totals = 0;
        this._estat = 'actiu';
    }

    get id(): string { return this._id; }
    get nom_usuari(): string { return this._nom_usuari; }
    get punts_totals(): number { return this._punts_totals; }
    get estat(): string { return this._estat; }

    set id(value: string) { this._id = value; }
    set nom_usuari(value: string) { this._nom_usuari = value; }
    set punts_totals(value: number) { this._punts_totals = value; }
    set estat(value: string) { this._estat = value; }
} 