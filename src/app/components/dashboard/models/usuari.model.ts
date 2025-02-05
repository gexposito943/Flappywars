export class Usuari {
    constructor(
        private _id: string = '',
        private _nom_usuari: string = '',
        private _email: string = '',
        private _nivell: number = 1,
        private _punts_totals: number = 0,
        private _data_registre: Date = new Date(),
        private _ultim_acces: Date | null = null,
        private _estat: 'actiu' | 'inactiu' | 'bloquejat' = 'actiu',
        private _intents_login: number = 0,
        private _nau_actual: string | null = null
    ) {}

    // Getters
    get id(): string { return this._id; }
    get nom_usuari(): string { return this._nom_usuari; }
    get email(): string { return this._email; }
    get nivell(): number { return this._nivell; }
    get punts_totals(): number { return this._punts_totals; }
    get data_registre(): Date { return this._data_registre; }
    get ultim_acces(): Date | null { return this._ultim_acces; }
    get estat(): 'actiu' | 'inactiu' | 'bloquejat' { return this._estat; }
    get intents_login(): number { return this._intents_login; }
    get nau_actual(): string | null { return this._nau_actual; }

    // Setters
    set id(value: string) { this._id = value; }
    set nom_usuari(value: string) { this._nom_usuari = value; }
    set email(value: string) { this._email = value; }
    set nivell(value: number) { this._nivell = value; }
    set punts_totals(value: number) { this._punts_totals = value; }
    set data_registre(value: Date) { this._data_registre = value; }
    set ultim_acces(value: Date | null) { this._ultim_acces = value; }
    set estat(value: 'actiu' | 'inactiu' | 'bloquejat') { this._estat = value; }
    set intents_login(value: number) { this._intents_login = value; }
    set nau_actual(value: string | null) { this._nau_actual = value; }
} 