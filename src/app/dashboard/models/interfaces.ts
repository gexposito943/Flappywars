export interface DashboardState {
    userStats: UserStats;
    userData: UserData;
    selectedShipId: number | null;
    availableShips: Ship[];
    loading: boolean;
    error: string | null;
    hasSavedGame: boolean;
    achievements: Achievement[];
}

export interface UserStats {
    millor_puntuacio: number;
    total_partides: number;
    temps_total_jugat: number;
    punts_totals: number;
}

export interface UserData {
    id: string;
    nom_usuari: string;
    email: string;
    nivell: number;
    punts_totals: number;
    data_registre: string;
    ultim_acces: string | null;
    estat: 'actiu' | 'inactiu' | 'bloquejat';
    intents_login: number;
    nau_actual: string | null;
    nau?: {
        id: string;
        nom: string;
        imatge_url: string;
    };
}

export interface Ship {
    id: number;
    nom: string;
    velocitat: number;
    imatge_url: string;
    descripcio: string;
    required_points: number;
}

export interface Achievement {
    id: number;
    nom: string;
    completat: boolean;
}