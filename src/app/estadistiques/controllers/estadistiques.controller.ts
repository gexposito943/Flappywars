import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { EstadistiquesModel } from '../models/estadistiques.model';

@Injectable()
export class EstadistiquesController {
    private model: EstadistiquesModel;

    constructor(
        private gameService: GameService,
        private router: Router
    ) {
        this.model = new EstadistiquesModel();
    }

    getModel(): EstadistiquesModel {
        return this.model;
    }

    loadGlobalStats(): void {
        this.model.loading = true;
        this.gameService.getGlobalStats().subscribe({
            next: (stats) => {
                this.model.globalStats = stats;
                this.model.loading = false;
            },
            error: (error) => {
                console.error('Error carregant estadístiques:', error);
                this.model.error = true;
                this.model.loading = false;
            }
        });
    }
} 