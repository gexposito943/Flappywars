import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { EstadistiquesModel } from './models/estadistiques.model';
import { GlobalStats } from '../../interfaces/stats.interface';
import { ApiResponse } from '../../interfaces/api.interface';
import { Estadistica } from '../../models/estadistica.model';

import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';


@Component({
    selector: 'app-estadistiques',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './estadistiques.component.html',
    styleUrls: ['./estadistiques.component.css']
})
export class EstadistiquesComponent implements OnInit {
    model = new EstadistiquesModel();

    constructor(
        private gameService: GameService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.loadEstadistiques();
    }

    private loadEstadistiques(): void {
        this.model.loading = true;
        this.model.error = false;
        
        this.gameService.getGlobalStats().subscribe({
            next: (response: ApiResponse<GlobalStats[]>) => {
                if (response.success && response.ranking) {
                    this.model.setEstadistiquesFromGlobalStats(response.ranking);
                }
            },
            error: (error) => {
                console.error('Error carregant estadístiques:', error);
                this.model.error = true;
            },
            complete: () => {
                this.model.loading = false;
            }
        });
    }

    formatTime(seconds: number): string {
        return this.model.formatTime(seconds);
    }

    returnToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
}
