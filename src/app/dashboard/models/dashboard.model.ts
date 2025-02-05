import { BaseModel } from './base.model';
import { DashboardState, UserStats, UserData, Ship, Achievement } from './interfaces';

export class DashboardModel extends BaseModel {
    private _data: DashboardState;
    user: UserData;
    selectedShip: number;

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
                id: '',
                email: '',
                data_registre: '',
                ultim_acces: '',
                estat: 'actiu',
                intents_login: 0,
                nom_usuari: '',
                nivell: 1,
                punts_totals: 0,
                nau_actual: null
            },
            selectedShipId: null,
            availableShips: [],
            loading: false,
            error: null,
            hasSavedGame: false,
            achievements: [],
        };
        this.user = {
            id: '',
            email: '',
            data_registre: '',
            ultim_acces: '',
            estat: 'actiu',
            intents_login: 0,
            nom_usuari: '',
            nivell: 1,
            punts_totals: 0,
            nau_actual: null
        };
        this.selectedShip = 1;
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
        return this._data.userData.nivell;
    }

    get username(): string {
        console.log('Getting username:', this._data.userData.nom_usuari); // Debug
        return this._data.userData.nom_usuari || 'Usuario';
    }

    get hasSavedGame(): boolean {
        return this._data.hasSavedGame || false;
    }

    get totalPoints(): number {
        return this._data.userData.punts_totals;
    }

    get error(): string | null {
        return this._data.error;
    }

    get loadingMessage(): string {
        return 'Carregant...';
    }

    get achievements(): Achievement[] {
        return this._data.achievements;
    }

    // Setters
    setUserStats(stats: UserStats): void {
        this.setData({
            userStats: stats,
            userData: {
                ...this._data.userData,
                punts_totals: stats.punts_totals
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
        return this._data.userData.punts_totals >= ship.required_points;
    }

    formatTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    validate(): boolean {
        return Boolean(
            this._data.userData &&
            this._data.userData.nom_usuari &&
            this._data.userData.nivell >= 1
        );
    }

    updateUserLevel(level: number): void {
        this.setData({
            userData: {
                ...this._data.userData,
                nivell: level
            }
        });
    }

    clearSession(): void {
        this.setData({
            userData: {
                nom_usuari: '',
                nivell: 1,
                punts_totals: 0,
                nau_actual: null,
                id: '',
                email: '',
                data_registre: '',
                ultim_acces: '',
                estat: 'actiu',
                intents_login: 0
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
                punts_totals: points
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

    setUserData(userData: UserData): void {
        console.log('Setting userData in model:', userData); // Debug
        this.setData({ 
            userData: {
                ...this._data.userData,
                ...userData,
                nom_usuari: userData.nom_usuari || this._data.userData.nom_usuari || 'Usuario'
            } 
        });
    }

    setAchievements(achievements: Achievement[]): void {
        this.setData({ achievements });
    }

    getCompletedAchievements(): Achievement[] {
        return this.achievements.filter(a => a.completat);
    }

    getAchievementProgress(): number {
        if (this.achievements.length === 0) return 0;
        return (this.getCompletedAchievements().length / this.achievements.length) * 100;
    }
} 