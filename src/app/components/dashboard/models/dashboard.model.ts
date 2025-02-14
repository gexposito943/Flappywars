import { BaseStats } from '../../../interfaces/base-stats.interface';
import { UserData } from '../../../interfaces/user-data.interface';
import { Nau } from '../../../interfaces/nau.interface';

interface Achievement {
    id: number;
    nom: string;
    completat: boolean;
}

export class DashboardModel implements BaseStats {
    punts_totals: number = 0;
    millor_puntuacio: number = 0;
    total_partides: number = 0;
    temps_total_jugat: number = 0;
    
    usuari: UserData | null = null;
    naus: Nau[] = [];
    nauSeleccionada: Nau | null = null;
    loading = false;
    error: string | null = null;
    hasSavedGame = false;

    private _achievements: Achievement[] = [];

    stats: BaseStats = {
        punts_totals: 0,
        millor_puntuacio: 0,
        total_partides: 0,
        temps_total_jugat: 0
    };

    isNauDisponible = (nau: Nau): boolean => 
        !nau.punts_requerits || (this.usuari?.punts_totals ?? 0) >= nau.punts_requerits;

    formatTime = (seconds: number): string => [
        Math.floor(seconds / 3600),
        Math.floor((seconds % 3600) / 60),
        seconds % 60
    ].map((n, i) => i > 0 ? n.toString().padStart(2, '0') : n)
     .join(':');

    canPlay = (): boolean => !!this.nauSeleccionada;

    getPlayButtonText = (): string => 
        this.canPlay() ? 'Jugar' : 'Selecciona una nau';

    getCompletedAchievements = (): Achievement[] => 
        this._achievements.filter(a => a.completat);

    getAchievementProgress = (): number => 
        this._achievements.length === 0 ? 0 : 
        (this.getCompletedAchievements().length / this._achievements.length) * 100;

    resetStats(): void {
        Object.assign(this, {
            punts_totals: 0,
            millor_puntuacio: 0,
            total_partides: 0,
            temps_total_jugat: 0
        });
        
        if (this.usuari) {
            this.usuari.punts_totals = 0;
        }
    }
} 