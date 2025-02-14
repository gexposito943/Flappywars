import { BaseStatsModel } from '../../../models/base-stats.model';

interface Achievement {
    id: number;
    nom: string;
    completat: boolean;
}

export class DashboardModel extends BaseStatsModel {
    usuari: any = null;
    naus: any[] = [];
    nauSeleccionada: any = null;
    loading: boolean = false;
    error: string | null = null;
    hasSavedGame: boolean = false;
    
    stats = {
        punts_totals: 0,
        millor_puntuacio: 0,
        total_partides: 0,
        temps_total_jugat: 0
    };

    private _achievements: Achievement[] = [];

    // Simplificamos la lógica de disponibilidad
    isNauDisponible(nau: any): boolean {
        console.log('Verificando nave:', {
            nau,
            puntsUsuari: this.usuari?.punts_totals,
            puntsRequerits: nau.punts_requerits
        });

        // Si no tiene puntos requeridos o el usuario tiene suficientes puntos
        return !nau.punts_requerits || this.usuari?.punts_totals >= nau.punts_requerits;
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

    // Mètodes addicionals
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

    resetAllPoints(): void {
        this.resetStats(this.stats);
        this.resetStats(this.usuari);
    }
} 