import { GlobalStats } from '../../../interfaces/base-stats.interface';

export class EstadistiquesModel {
    private _estadistiques: GlobalStats[] = [];
    private _loading: boolean = false;
    private _error: boolean = false;
    private _itemsPerPage: number = 5;
    private _currentPage: number = 1;

    get estadistiques(): GlobalStats[] {
        return this._estadistiques;
    }

    get loading(): boolean { return this._loading; }
    get error(): boolean { return this._error; }
    get itemsPerPage(): number { return this._itemsPerPage; }
    get currentPage(): number { return this._currentPage; }
    get totalPages(): number {
        return Math.ceil(this._estadistiques.length / this._itemsPerPage);
    }

    set loading(value: boolean) { this._loading = value; }
    set error(value: boolean) { this._error = value; }
    set currentPage(value: number) { this._currentPage = value; }

    setEstadistiquesFromGlobalStats(stats: GlobalStats[]): void {
        this._estadistiques = stats.map((stat, index) => ({
            ...stat,
            posicio: index + 1
        }));
    }

    getPaginatedEstadistiques(): GlobalStats[] {
        const startIndex = (this._currentPage - 1) * this._itemsPerPage;
        const endIndex = startIndex + this._itemsPerPage;
        return this._estadistiques.slice(startIndex, endIndex);
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return [
            hours > 0 ? `${hours}h` : '',
            minutes > 0 ? `${minutes}m` : '',
            `${secs}s`
        ].filter(Boolean).join(' ');
    }
} 