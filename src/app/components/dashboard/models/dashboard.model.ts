import { Usuari, Nau, Partida, Estadistica } from '../../../models';
import { UserStats } from '../../../interfaces/stats.interface';

interface Achievement {
    id: number;
    nom: string;
    completat: boolean;
}

export class DashboardModel {
    // Datos básicos
    usuari: any = null;
    naus: any[] = [];
    nauSeleccionada: any = null;
    
    // Estados
    loading: boolean = false;
    error: string | null = null;
    
    // Estadísticas
    stats = {
        punts_totals: 0,
        millor_puntuacio: 0,
        total_partides: 0,
        temps_total_jugat: 0
    };

    hasSavedGame: boolean = false;

    private _achievements: Achievement[] = [];

    // Métodos simples
    isNauDisponible(nau: any): boolean {
        return this.usuari?.punts_totals >= nau.punts_requerits;
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    canPlay(): boolean {
        return this.nauSeleccionada !== null;
    }

    // Métodos adicionales
    getPlayButtonText(): string {
        return this.canPlay() ? 'Jugar' : 'Selecciona una nau';
    }

    getCompletedAchievements(): Achievement[] {
        return this._achievements.filter(a => a.completat);
    }

    getAchievementProgress(): number {
        if (this._achievements.length === 0) return 0;
        return (this.getCompletedAchievements().length / this._achievements.length) * 100;
    }
} 