export class Partida {
    constructor(
        private _id: string = '',
        private _usuari_id: string = '',
        private _puntuacio: number = 0,
        private _duracio_segons: number = 0,
        private _nau_utilitzada: string = '',
        private _data_partida: Date = new Date(),
        private _obstacles_superats: number = 0,
        private _completada: boolean = true
    ) {}

    // Getters
    get id(): string { return this._id; }
    get usuari_id(): string { return this._usuari_id; }
    get puntuacio(): number { return this._puntuacio; }
    get duracio_segons(): number { return this._duracio_segons; }
    get nau_utilitzada(): string { return this._nau_utilitzada; }
    get data_partida(): Date { return this._data_partida; }
    get obstacles_superats(): number { return this._obstacles_superats; }
    get completada(): boolean { return this._completada; }

    // Setters
    set id(value: string) { this._id = value; }
    set usuari_id(value: string) { this._usuari_id = value; }
    set puntuacio(value: number) { this._puntuacio = value; }
    set duracio_segons(value: number) { this._duracio_segons = value; }
    set nau_utilitzada(value: string) { this._nau_utilitzada = value; }
    set data_partida(value: Date) { this._data_partida = value; }
    set obstacles_superats(value: number) { this._obstacles_superats = value; }
    set completada(value: boolean) { this._completada = value; }
} 