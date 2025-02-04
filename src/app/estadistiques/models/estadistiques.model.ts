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

    get globalStats(): GlobalStats[] {
        return this._globalStats;
    }

    set globalStats(stats: GlobalStats[]) {
        this._globalStats = stats;
    }

    get loading(): boolean {
        return this._loading;
    }

    set loading(value: boolean) {
        this._loading = value;
    }

    get error(): boolean {
        return this._error;
    }

    set error(value: boolean) {
        this._error = value;
    }
} 