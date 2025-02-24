export interface BaseStats {
    punts_totals: number;
    millor_puntuacio: number;
    total_partides: number;
    temps_total_jugat: number;
}

export interface UserStats extends BaseStats {
    puntuacio: number;
    temps_jugat: number;
    obstacles_superats: number;
    nivell: number;
}

export interface GlobalStats extends BaseStats {
    id: string;
    posicio?: number;
    username: string;
}

export interface IResetableStats {
    punts_totals: number;
} 