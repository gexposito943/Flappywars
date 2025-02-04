import { BaseModel } from './base.model';
import { DashboardState, UserStats, UserData, Ship } from './interfaces';

export class DashboardModel extends BaseModel {
    private _data: DashboardState;

    constructor() {
        super();
        this._data = {
            userStats: {
                millor_puntuacio: 0,
                total_partides: 0,
                temps_total_jugat: 0,
                punts_totals: 0
            },
            userData: {
                username: 'Usuario',
                nivel: 1,
                puntosTotales: 0,
                naveActual: 1
            },
            selectedShipId: null,
            availableShips: [],
            loading: false,
            error: null
        };
    }

    getData(): DashboardState {
        return this._data;
    }

    setData(data: Partial<DashboardState>): void {
        this._data = { ...this._data, ...data };
    }

    // Getters
    get userStats(): UserStats {
        return this._data.userStats;
    }

    get userData(): UserData {
        return this._data.userData;
    }

    get selectedShipId(): number | null {
        return this._data.selectedShipId;
    }

    get availableShips(): Ship[] {
        return this._data.availableShips;
    }

    get isLoading(): boolean {
        return this._data.loading;
    }

    get userLevel(): number {
        return this._data.userData.nivel;
    }

    get username(): string {
        return this._data.userData.username;
    }

    // Setters
    setUserStats(stats: UserStats): void {
        this.setData({
            userStats: stats,
            userData: {
                ...this._data.userData,
                puntosTotales: stats.punts_totals
            }
        });
    }

    setSelectedShip(shipId: number): boolean {
        const ship = this.availableShips.find(s => s.id === shipId);
        if (ship && this.isShipUnlocked(ship)) {
            this.setData({
                selectedShipId: shipId,
                userData: {
                    ...this._data.userData,
                    naveActual: shipId
                }
            });
            return true;
        }
        return false;
    }

    setLoading(loading: boolean): void {
        this.setData({ loading });
    }

    setError(error: string | null): void {
        this.setData({ error });
    }

    isShipUnlocked(ship: Ship): boolean {
        return this.userData.puntosTotales >= ship.required_points;
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${remainingSeconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${remainingSeconds}s`;
    }

    validate(): boolean {
        return (
            this._data.userStats !== null &&
            this._data.userData !== null &&
            Array.isArray(this._data.availableShips)
        );
    }

    updateUserLevel(level: number): void {
        this.setData({
            userData: {
                ...this._data.userData,
                nivel: level
            }
        });
    }
} 