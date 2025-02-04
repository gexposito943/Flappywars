export interface DashboardState {
    userStats: UserStats;
    userData: UserData;
    selectedShipId: number | null;
    availableShips: Ship[];
    loading: boolean;
    error: string | null;
    hasSavedGame: boolean;
}

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