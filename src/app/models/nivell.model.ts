export class Nivell {
    constructor(
        private _id: string = '',
        private _nom: string = '',
        private _imatge_url: string = '',
        private _punts_requerits: number = 0
    ) {}

    // Getters
    get id(): string { return this._id; }
    get nom(): string { return this._nom; }
    get imatge_url(): string { return this._imatge_url; }
    get punts_requerits(): number { return this._punts_requerits; }

    // Setters
    set id(value: string) { this._id = value; }
    set nom(value: string) { this._nom = value; }
    set imatge_url(value: string) { this._imatge_url = value; }
    set punts_requerits(value: number) { this._punts_requerits = value; }
} 