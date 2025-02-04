import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardController, DashboardActionTypes } from './controllers/dashboard.controller';
import { DashboardModel } from './models/dashboard.model';
import { UserStats } from './models/interfaces';
import { Ship } from './models/interfaces';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [CommonModule],
    providers: [DashboardController]
})
export class DashboardComponent implements OnInit {
    model: DashboardModel;

    constructor(public controller: DashboardController) {
        this.model = controller.getModel();
    }

    ngOnInit(): void {
        this.controller.initialize();
    }

    onShipSelect(shipId: number): void {
        this.controller.dispatch({
            type: DashboardActionTypes.SELECT_SHIP,
            payload: shipId
        });
    }

    onStartGame(): void {
        this.controller.dispatch({
            type: DashboardActionTypes.START_GAME
        });
    }

    onLogout(): void {
        this.controller.dispatch({
            type: DashboardActionTypes.LOGOUT
        });
    }

    get userStats(): UserStats {
        return this.model.userStats;
    }

    formatTime(seconds: number): string {
        return this.model.formatTime(seconds);
    }

    getUserLevel(): number {
        return this.model.userLevel;
    }

    getUsername(): string {
        return this.model.username;
    }

    isShipUnlocked(ship: Ship): boolean {
        return this.model.isShipUnlocked(ship);
    }

    canStartGame(): boolean {
        return this.model.canStartGame();
    }

    get hasSavedGame(): boolean {
        return this.model.hasSavedGame;
    }

    onRestoreGame(): void {
        this.controller.dispatch({
            type: DashboardActionTypes.RESTORE_GAME
        });
    }

    onViewGlobalStats(): void {
        this.controller.dispatch({
            type: DashboardActionTypes.VIEW_GLOBAL_STATS
        });
    }
}