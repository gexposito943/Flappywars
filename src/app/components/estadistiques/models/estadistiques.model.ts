import { GlobalStats } from '../../../interfaces/base-stats.interface';
export class EstadistiquesModel {
    private _estadistiques: GlobalStats[] = [];
    private _loading: boolean = false;
    private _error: boolean = false;

    get estadistiques(): GlobalStats[] {
        return this._estadistiques;
    }

    get loading(): boolean { return this._loading; }
    get error(): boolean { return this._error; }

    set loading(value: boolean) { this._loading = value; }
    set error(value: boolean) { this._error = value; }

    setEstadistiquesFromGlobalStats(stats: GlobalStats[]): void {
        this._estadistiques = stats.map((stat, index) => ({
            ...stat,
            posicio: index + 1
        }));
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
} 