export interface UserStats {
    millor_puntuacio: number;
    total_partides: number;
    temps_total_jugat: number;
    punts_totals: number;
}

export interface UserData {
    username: string;
    nivel: number;
    puntosTotales: number;
    naveActual?: number;
}

export interface Ship {
    id: number;
    nom: string;
    velocitat: number;
    imatge_url: string;
    descripcio: string;
    required_points: number;
}

export class DashboardModel {
    private _userStats: UserStats;
    private _userData: UserData;

    constructor() {
        this._userStats = {
            millor_puntuacio: 0,
            total_partides: 0,
            temps_total_jugat: 0,
            punts_totals: 0
        };
        this._userData = {
            username: 'Usuario',
            nivel: 1,
            puntosTotales: 0,
            naveActual: 1
        };
    }

    get userStats(): UserStats {
        return this._userStats;
    }

    get userData(): UserData {
        return this._userData;
    }
} 