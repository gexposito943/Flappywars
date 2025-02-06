import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Estadistica } from './models/estadistica.model';
import { Usuari } from './models/usuari.model';

interface GlobalStats {
    id: string;
    nom_usuari: string;
    punts_totals: number;
    millor_puntuacio: number;
    temps_total_jugat: number;
    estat: string;
}

@Component({
    selector: 'app-estadistiques',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './estadistiques.component.html',
    styleUrls: ['./estadistiques.component.css']
})
export class EstadistiquesComponent implements OnInit {
    private _estadistiques: Estadistica[] = [];
    private _loading: boolean = true;
    private _error: boolean = false;

    constructor(
        private gameService: GameService,
        private router: Router
    ) {}

    get loading(): boolean {
        return this._loading;
    }

    get error(): boolean {
        return this._error;
    }

    get estadistiques(): Estadistica[] {
        return this._estadistiques.sort((a, b) => b.usuari.punts_totals - a.usuari.punts_totals);
    }

    ngOnInit(): void {
        this.loadEstadistiques();
    }

    private loadEstadistiques(): void {
        this._loading = true;
        this._error = false;
        
        this.gameService.getGlobalStats().subscribe({
            next: (stats: any[]) => {
                this._estadistiques = stats
                    .filter(stat => stat.estat === 'actiu')
                    .map(stat => {
                        const estadistica = new Estadistica();
                        const usuari = new Usuari();

                        usuari.id = stat.id;
                        usuari.nom_usuari = stat.nom_usuari;
                        usuari.punts_totals = stat.punts_totals;
                        usuari.estat = stat.estat;

                        estadistica.usuari = usuari;
                        estadistica.millor_puntuacio = stat.millor_puntuacio;
                        estadistica.temps_total_jugat = stat.temps_total_jugat;

                        return estadistica;
                    });
                
                this._loading = false;
            },
            error: (error) => {
                console.error('Error carregant estadístiques:', error);
                this._error = true;
                this._loading = false;
            }
        });
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

    returnToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
}
