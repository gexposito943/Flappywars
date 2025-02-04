import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BaseController, Action } from '../core/base.controller';
import { DashboardModel } from '../models/dashboard.model';
import { RegistreService } from '../../services/registre.service';
import { GameService } from '../../services/game.service';

export enum DashboardActionTypes {
    SELECT_SHIP = '[Dashboard] Select Ship',
    START_GAME = '[Dashboard] Start Game',
    LOGOUT = '[Dashboard] Logout',
    LOAD_STATS = '[Dashboard] Load Stats',
    UPDATE_LEVEL = '[Dashboard] Update Level'
}

@Injectable()
export class DashboardController extends BaseController<DashboardModel> {
    constructor(
        private router: Router,
        private registreService: RegistreService,
        private gameService: GameService
    ) {
        super(new DashboardModel());
    }

    initialize(): void {
        const userData = this.registreService.getUserData();
        if (userData) {
            this.model.setData({ userData: userData });
        }
        this.loadUserStats();
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
        if (this.model.setSelectedShip(shipId)) {
            this.registreService.setUserData(this.model.userData);
        }
    }

    private handleStartGame(): void {
        if (this.model.selectedShipId) {
            this.router.navigate(['/game'], {
                state: { 
                    shipId: this.model.selectedShipId,
                    userData: this.model.userData
                }
            });
        }
    }

    private handleLogout(): void {
        this.model.clearSession();
        this.registreService.logout();
        this.router.navigate(['/']);
    }

    private loadUserStats(): void {
        this.gameService.getUserStats().subscribe({
            next: (stats) => {
                this.model.setUserStats(stats);
            },
            error: (error) => {
                this.handleError(error);
            }
        });
    }

    private handleUpdateLevel(level: number): void {
        this.model.updateUserLevel(level);
        this.registreService.setUserData(this.model.userData);
    }
}