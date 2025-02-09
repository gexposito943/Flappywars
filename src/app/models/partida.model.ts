export class Partida {
    id?: string;
    usuari_id: string = '';
    puntuacio: number = 0;
    duracio_segons: number = 0;
    nau_utilitzada: string = '';
    nivell_dificultat: 'facil' | 'normal' | 'dificil' = 'normal';
    obstacles_superats: number = 0;
    completada: number = 0;
    posicioX: number = 0;
    posicioY: number = 0;
    obstacles: Array<{
        posicioX: number;
        posicioY: number;
    }> = [];

    private _data_creacio: Date = new Date();
    private _data_modificacio: Date = new Date();

    get data_creacio(): Date { return this._data_creacio; }
    get data_modificacio(): Date { return this._data_modificacio; }

    set data_creacio(value: Date) { this._data_creacio = value; }
    set data_modificacio(value: Date) { this._data_modificacio = value; }
} 