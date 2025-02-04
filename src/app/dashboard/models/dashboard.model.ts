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
            error: null,
            hasSavedGame: false
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

    get hasSavedGame(): boolean {
        return this._data.hasSavedGame || false;
    }

    get totalPoints(): number {
        return this._data.userData.puntosTotales;
    }

    get error(): string | null {
        return this._data.error;
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

    setSelectedShip(shipId: number | null): void {
        this.setData({ selectedShipId: shipId });
    }

    setLoading(loading: boolean): void {
        this.setData({ loading });
    }

    setError(error: string | null): void {
        this.setData({ error });
    }

    isShipUnlocked(ship: Ship): boolean {
        return this._data.userData.puntosTotales >= ship.required_points;
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
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

    clearSession(): void {
        this.setData({
            userData: {
                username: '',
                nivel: 1,
                puntosTotales: 0,
                naveActual: undefined
            },
            selectedShipId: null
        });
    }

    canStartGame(): boolean {
        return this._data.selectedShipId !== null;
    }

    getGameStartData() {
        if (!this.canStartGame()) return null;
        
        return {
            shipId: this._data.selectedShipId,
            userData: this._data.userData
        };
    }

    setHasSavedGame(value: boolean): void {
        this.setData({ hasSavedGame: value });
    }

    getRestoredGameState(gameState: any) {
        return {
            restored: true,
            gameState: {
                puntuacio: gameState.puntuacio,
                nau_id: gameState.nau_id
            }
        };
    }

    updateTotalPoints(points: number): void {
        this.setData({
            userData: {
                ...this._data.userData,
                puntosTotales: points
            }
        });
    }

    getDefaultStats(): UserStats {
        return {
            millor_puntuacio: 0,
            total_partides: 0,
            temps_total_jugat: 0,
            punts_totals: 0
        };
    }

    setAvailableShips(ships: Ship[]): void {
        const shipsWithCorrectPaths = ships.map(ship => ({
            ...ship,
            imatge_url: `assets/images/naus/${ship.imatge_url.split('/').pop()}`
        }));
        
        this.setData({ availableShips: shipsWithCorrectPaths });
    }

    getShipDescription(shipId: number): string | undefined {
        return this.availableShips.find(ship => ship.id === shipId)?.descripcio;
    }

    canPlay(): boolean {
        return this.selectedShipId !== null;
    }

    getPlayButtonText(): string {
        return this.canPlay() ? 'Jugar' : 'Selecciona una nau';
    }
} 