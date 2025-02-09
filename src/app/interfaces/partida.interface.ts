export interface GameResult {
    usuari_id: string;
    puntuacio: number;
    duracio_segons: number;
    nau_utilitzada: string;
    nivell_dificultat: 'facil' | 'normal' | 'dificil';
    obstacles_superats: number;
    completada: boolean;
    millor_puntuacio?: number;
    total_partides?: number;
    temps_total_jugat?: number;
} 