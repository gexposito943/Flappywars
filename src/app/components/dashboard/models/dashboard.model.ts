import { Usuari, Nau, Partida, Estadistica } from '../../../models';
import { UserStats } from '../../../interfaces/stats.interface';

interface Achievement {
    id: number;
    nom: string;
    completat: boolean;
}

export class DashboardModel {
    private _usuari: Usuari = new Usuari();
    private _naus: Nau[] = [];
    private _nauSeleccionada: Nau | null = null;
    private _loading: boolean = false;
    private _error: string | null = null;
    private _hasSavedGame: boolean = false;
    private _stats: Estadistica = new Estadistica();
    private _achievements: Achievement[] = [];

    constructor() {
        this._stats = new Estadistica();
    }

    // Getters
    get usuari(): Usuari { return this._usuari; }
    get naus(): Nau[] { return this._naus; }
    get nauSeleccionada(): Nau | null { return this._nauSeleccionada; }
    get loading(): boolean { return this._loading; }
    get error(): string | null { return this._error; }
    get hasSavedGame(): boolean { return this._hasSavedGame; }
    get stats(): Estadistica { return this._stats; }
    get achievements(): Achievement[] { return this._achievements; }

    // Setters
    set usuari(value: Usuari) { this._usuari = value; }
    set naus(value: Nau[]) { this._naus = value; }
    set nauSeleccionada(value: Nau | null) { this._nauSeleccionada = value; }
    set loading(value: boolean) { this._loading = value; }
    set error(value: string | null) { this._error = value; }
    set hasSavedGame(value: boolean) { this._hasSavedGame = value; }
    set stats(value: Estadistica) { this._stats = value; }
    set achievements(value: Achievement[]) { this._achievements = value; }

    // Métodos de utilidad
    isNauDisponible(nau: Nau): boolean {
        return this._usuari.punts_totals >= nau.punts_requerits;
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
        this._nauSeleccionada = null;
        this._error = null;
        this._hasSavedGame = false;
        this._stats = new Estadistica();
        this._achievements = [];
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