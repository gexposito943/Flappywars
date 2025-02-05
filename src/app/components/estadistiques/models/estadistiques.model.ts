/**
 * Model que gestiona les dades i l'estat de les estadístiques
 * Conté tota la lògica de negoci relacionada amb les estadístiques globals
 */
export interface GlobalStats {
    username: string;
    punts_totals: number;
    millor_puntuacio: number;
    total_partides: number;
    temps_total_jugat: number;
}

export class EstadistiquesModel {
    private _globalStats: GlobalStats[] = [];
    private _loading: boolean = true;
    private _error: boolean = false;

    // Getters per accedir a les dades
    get globalStats(): GlobalStats[] {
        return this._globalStats;
    }

    get loading(): boolean {
        return this._loading;
    }

    get error(): boolean {
        return this._error;
    }

    // Setters per modificar les dades
    setGlobalStats(stats: GlobalStats[]): void {
        this._globalStats = stats;
    }

    // Mètodes de gestió d'estat
    resetState(): void {
        this._loading = false;
        this._error = false;
    }

    handleError(): void {
        this._error = true;
        this._loading = false;
    }

    startLoading(): void {
        this._loading = true;
        this._error = false;
    }
} 