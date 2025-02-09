export class Nau {
    constructor(
        private _id: string = '',
        private _nom: string = '',
        private _velocitat: number = 1,
        private _imatge_url: string = '',
        private _descripcio: string = '',
        private _disponible: boolean = true,
        private _data_creacio: Date = new Date(),
        private _punts_requerits: number = 0
    ) {}

    // Getters
    get id(): string { return this._id; }
    get nom(): string { return this._nom; }
    get velocitat(): number { return this._velocitat; }
    get imatge_url(): string { return this._imatge_url; }
    get descripcio(): string { return this._descripcio; }
    get disponible(): boolean { return this._disponible; }
    get data_creacio(): Date { return this._data_creacio; }
    get punts_requerits(): number { return this._punts_requerits; }

    // Setters
    set id(value: string) { this._id = value; }
    set nom(value: string) { this._nom = value; }
    set velocitat(value: number) { this._velocitat = value; }
    set imatge_url(value: string) { this._imatge_url = value; }
    set descripcio(value: string) { this._descripcio = value; }
    set disponible(value: boolean) { this._disponible = value; }
    set data_creacio(value: Date) { this._data_creacio = value; }
    set punts_requerits(value: number) { this._punts_requerits = value; }
} 