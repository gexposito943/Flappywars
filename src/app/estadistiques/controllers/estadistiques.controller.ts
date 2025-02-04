import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { EstadistiquesModel } from '../models/estadistiques.model';
import { BaseController } from '../core/base.controller';

/**
 * Controlador que gestiona la lògica de les estadístiques
 * Fa d'intermediari entre la vista i el model, i gestiona les crides al servei
 */
@Injectable()
export class EstadistiquesController extends BaseController<EstadistiquesModel> {
    constructor(
        private gameService: GameService,
        private router: Router
    ) {
        super(new EstadistiquesModel());
    }

    // Carrega les estadístiques globals del servidor
    loadGlobalStats(): void {
        this.model.startLoading();
        this.gameService.getGlobalStats().subscribe({
            next: (stats) => {
                this.model.setGlobalStats(stats);
                this.model.resetState();
            },
            error: (error) => {
                console.error('Error carregant estadístiques:', error);
                this.model.handleError();
            }
        });
    }

    // Formatja el temps en format llegible
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

    // Navega cap al dashboard
    returnToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
} 