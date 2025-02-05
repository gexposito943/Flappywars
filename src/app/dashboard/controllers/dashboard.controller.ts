import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { BaseController, Action } from '../core/base.controller';
import { DashboardModel } from '../models/dashboard.model';
import { RegistreService } from '../../services/registre.service';
import { GameService } from '../../services/game.service';
import { ShipService } from '../../services/ship.service';
import { UserData } from '../models/interfaces';
import { isPlatformBrowser } from '@angular/common';

export enum DashboardActionTypes {
    SELECT_SHIP = '[Dashboard] Select Ship',
    START_GAME = '[Dashboard] Start Game',
    LOGOUT = '[Dashboard] Logout',
    LOAD_STATS = '[Dashboard] Load Stats',
    UPDATE_LEVEL = '[Dashboard] Update Level',
    RESTORE_GAME = '[Dashboard] Restore Game',
    CHECK_SAVED_GAME = '[Dashboard] Check Saved Game',
    VIEW_GLOBAL_STATS = '[Dashboard] View Global Stats'
}

@Injectable()
export class DashboardController extends BaseController<DashboardModel> {
    constructor(
        private router: Router,
        private registreService: RegistreService,
        private gameService: GameService,
        private shipService: ShipService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        super(new DashboardModel());
    }

    initialize(): void {
        if (isPlatformBrowser(this.platformId)) {
            const userData = this.registreService.getUserData();
            if (userData) {
                this.model.setData({ userData: userData });
            }
            this.loadUserStats();
            this.checkSavedGame();
            this.loadShips();
            this.loadAchievements();
        }
    }

    dispatch(action: Action): void {
        this.model.setLoading(true);
        this.clearError();

        try {
            switch (action.type) {
                case DashboardActionTypes.SELECT_SHIP:
                    this.handleSelectShip(action.payload);
                    break;
                case DashboardActionTypes.START_GAME:
                    this.handleStartGame();
                    break;
                case DashboardActionTypes.LOGOUT:
                    this.handleLogout();
                    break;
                case DashboardActionTypes.LOAD_STATS:
                    this.loadUserStats();
                    break;
                case DashboardActionTypes.UPDATE_LEVEL:
                    this.handleUpdateLevel(action.payload);
                    break;
                case DashboardActionTypes.RESTORE_GAME:
                    this.handleRestoreGame();
                    break;
                case DashboardActionTypes.CHECK_SAVED_GAME:
                    this.checkSavedGame();
                    break;
                case DashboardActionTypes.VIEW_GLOBAL_STATS:
                    this.handleViewGlobalStats();
                    break;
                default:
                    console.warn('Unhandled action type:', action.type);
            }
        } catch (error) {
            this.handleError(error as Error);
        } finally {
            this.model.setLoading(false);
        }
    }

    private handleSelectShip(shipId: number): void {
        this.model.setSelectedShip(shipId);
        this.registreService.setUserData(this.model.userData as Omit<UserData, 'contrasenya'>);
    }

    private handleStartGame(): void {
        const gameData = this.model.getGameStartData();
        if (gameData) {
            this.router.navigate(['/game'], {
                state: gameData
            });
        }
    }

    private handleLogout(): void {
        this.model.clearSession();
        this.registreService.logout();
        this.router.navigate(['/']);
    }

    private loadUserStats(): void {
        this.model.setLoading(true);
        this.gameService.getUserStats().subscribe({
            next: (stats) => {
                this.model.setUserStats(stats);
                this.model.setLoading(false);
            },
            error: (error) => {
                this.handleError(error);
                this.model.setUserStats(this.model.getDefaultStats());
            }
        });
    }

    private handleUpdateLevel(level: number): void {
        this.model.updateUserLevel(level);
        this.registreService.setUserData(this.model.userData);
    }

    private checkSavedGame(): void {
        if (isPlatformBrowser(this.platformId)) {
            const hasSaved = this.gameService.hasSavedGame();
            this.model.setHasSavedGame(hasSaved);
        } else {
            this.model.setHasSavedGame(false);
        }
    }

    private handleRestoreGame(): void {
        this.gameService.restoreGame().subscribe({
            next: (response) => {
                if (response.success) {
                    const gameState = this.model.getRestoredGameState(response.gameState);
                    this.router.navigate(['/game'], { state: gameState });
                }
            },
            error: (error) => this.handleError(error)
        });
    }

    private handleViewGlobalStats(): void {
        this.router.navigate(['/estadistiques']);
    }

    private loadShips(): void {
        this.model.setLoading(true);
        this.shipService.getShips().subscribe({
            next: (ships) => {
                this.model.setAvailableShips(ships);
                this.model.setLoading(false);
            },
            error: (error) => {
                this.handleError(error);
                // Cargar naves por defecto en caso de error
                this.model.setAvailableShips([
                    {
                        id: 1,
                        nom: 'Nau de Combat',
                        velocitat: 100,
                        imatge_url: 'x-wing.png',
                        descripcio: 'Nau de combat versàtil',
                        required_points: 0
                    }
                ]);
            }
        });
    }

    private loadUserData(): void {
        const userData = this.registreService.getUserData();
        if (userData && this.model.validate()) {
            this.model.setUserData(userData);
        } else {
            this.handleError(new Error('Invalid user data'));
        }
    }

    private updateUserData(updates: Partial<UserData>): void {
        const updatedData = {
            ...this.model.userData,
            ...updates
        };
        this.model.setUserData(updatedData);
        this.registreService.setUserData(updatedData);
    }

    private loadAchievements(): void {
        this.gameService.getUserAchievements().subscribe({
            next: (achievements) => {
                this.model.setAchievements(achievements);
            },
            error: (error) => {
                this.handleError(error);
                this.model.setAchievements([]);
            }
        });
    }

    protected override handleError(error: Error): void {
        console.error('Controller Error:', error);
        this.model.setError(error.message);
        this.model.setLoading(false);
    }

    protected override clearError(): void {
        this.model.setError(null);
    }
}