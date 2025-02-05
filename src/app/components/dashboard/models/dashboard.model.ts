import { Usuari } from './usuari.model';
import { Nau } from './nau.model';
import { Partida } from './partida.model';

interface UserStats {
    millor_puntuacio: number;
    total_partides: number;
    temps_total_jugat: number;
    punts_totals: number;
}

interface Achievement {
    id: number;
    nom: string;
    completat: boolean;
}

export class DashboardModel {
    private _usuari: Usuari;
    private _naus: Nau[];
    private _partides: Partida[];
    private _nauSeleccionada: Nau | null;
    private _loading: boolean;
    private _error: string | null;
    private _hasSavedGame: boolean;
    private _achievements: Achievement[];
    private _stats: UserStats;

    constructor() {
        this._usuari = new Usuari();
        this._naus = [];
        this._partides = [];
        this._nauSeleccionada = null;
        this._loading = false;
        this._error = null;
        this._hasSavedGame = false;
        this._achievements = [];
        this._stats = {
            millor_puntuacio: 0,
            total_partides: 0,
            temps_total_jugat: 0,
            punts_totals: 0
        };
    }

    // Getters
    get usuari(): Usuari { return this._usuari; }
    get naus(): Nau[] { return this._naus; }
    get partides(): Partida[] { return this._partides; }
    get nauSeleccionada(): Nau | null { return this._nauSeleccionada; }
    get loading(): boolean { return this._loading; }
    get error(): string | null { return this._error; }
    get hasSavedGame(): boolean { return this._hasSavedGame; }
    get achievements(): Achievement[] { return this._achievements; }
    get stats(): UserStats { return this._stats; }

    // Setters
    set usuari(value: Usuari) { this._usuari = value; }
    set naus(value: Nau[]) { this._naus = value; }
    set partides(value: Partida[]) { this._partides = value; }
    set nauSeleccionada(value: Nau | null) { this._nauSeleccionada = value; }
    set loading(value: boolean) { this._loading = value; }
    set error(value: string | null) { this._error = value; }
    set hasSavedGame(value: boolean) { this._hasSavedGame = value; }
    set achievements(value: Achievement[]) { this._achievements = value; }
    set stats(value: UserStats) { this._stats = value; }

    // Métodos de utilidad
    getMillorPuntuacio(): number {
        return Math.max(...this._partides.map(p => p.puntuacio), 0);
    }

    getTotalPartides(): number {
        return this._partides.length;
    }

    getTempsTotal(): number {
        return this._partides.reduce((total, p) => total + p.duracio_segons, 0);
    }

    isNauDisponible(nau: Nau): boolean {
        return this._usuari.punts_totals >= nau.velocitat * 1000;
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    clear(): void {
        this._usuari = new Usuari();
        this._naus = [];
        this._partides = [];
        this._nauSeleccionada = null;
        this._error = null;
        this._hasSavedGame = false;
        this._achievements = [];
        this._stats = {
            millor_puntuacio: 0,
            total_partides: 0,
            temps_total_jugat: 0,
            punts_totals: 0
        };
    }

    canPlay(): boolean {
        return this._nauSeleccionada !== null;
    }

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