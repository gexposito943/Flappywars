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
    private _selectedShipId: number | null = null;
    private _availableShips: Ship[] = [
        {
            id: 1,
            nom: 'Nau de Combat',
            velocitat: 100,
            imatge_url: 'assets/images/naus/x-wing.png',
            descripcio: 'Nau de combat versàtil',
            required_points: 0
        },
        {
            id: 2,
            nom: 'Nau Imperial',
            velocitat: 120,
            imatge_url: 'assets/images/naus/tie-fighter.png',
            descripcio: 'Nau ràpida de l\'Imperi',
            required_points: 1000
        },
        {
            id: 3,
            nom: 'Nau Llegendària',
            velocitat: 150,
            imatge_url: 'assets/images/naus/millenium-falcon.png',
            descripcio: 'Nau llegendària',
            required_points: 2500
        }
    ];

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

    get selectedShipId(): number | null {
        return this._selectedShipId;
    }

    get availableShips(): Ship[] {
        return this._availableShips;
    }

    setSelectedShip(shipId: number): void {
        const ship = this._availableShips.find(s => s.id === shipId);
        if (ship && this.isShipUnlocked(ship)) {
            this._selectedShipId = shipId;
            this._userData = {
                ...this._userData,
                naveActual: shipId
            };
        }
    }

    isShipUnlocked(ship: Ship): boolean {
        return this._userData.puntosTotales >= ship.required_points;
    }

    setUserData(data: UserData): void {
        this._userData = { ...this._userData, ...data };
    }
} 