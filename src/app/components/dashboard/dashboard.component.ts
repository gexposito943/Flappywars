import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardModel } from './models/dashboard.model';
import { Nau } from './models/nau.model';
import { RegistreService } from '../../services/registre.service';
import { GameService } from '../../services/game.service';
import { ShipService } from '../../services/ship.service';
import { Usuari } from './models/usuari.model';
import { Partida } from './models/partida.model';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
    dashboardModel: DashboardModel;

    constructor(
        private router: Router,
        private registreService: RegistreService,
        private gameService: GameService,
        private shipService: ShipService
    ) {
        this.dashboardModel = new DashboardModel();
    }

    ngOnInit(): void {
        this.loadUserData();
        this.loadShips();
        this.loadGames();
    }

    private loadUserData(): void {
        const userData = this.registreService.getUserData();
        if (userData) {
            const usuari = new Usuari();
            Object.assign(usuari, {
                _id: userData.id,
                _nom_usuari: userData.nom_usuari,
                _email: userData.email,
                _nivell: userData.nivell,
                _punts_totals: userData.punts_totals,
                _data_registre: userData.data_registre,
                _ultim_acces: userData.ultim_acces,
                _estat: userData.estat,
                _intents_login: userData.intents_login,
                _nau_actual: userData.nau_actual
            });
            this.dashboardModel.usuari = usuari;
        } else {
            this.router.navigate(['/']);
        }
    }

    private loadShips(): void {
        this.dashboardModel.loading = true;
        this.shipService.getShips().subscribe({
            next: (ships) => {
                const naus = ships.map(ship => {
                    const nau = new Nau();
                    Object.assign(nau, {
                        _id: ship.id,
                        _nom: ship.nom,
                        _velocitat: ship.velocitat,
                        _imatge_url: ship.imatge_url,
                        _descripcio: ship.descripcio,
                        _disponible: true,
                        _data_creacio: new Date()
                    });
                    return nau;
                });
                this.dashboardModel.naus = naus;
                this.dashboardModel.loading = false;
            },
            error: (error) => {
                this.dashboardModel.error = error.message;
                this.dashboardModel.loading = false;
            }
        });
    }

    private loadGames(): void {
        this.dashboardModel.loading = true;
        this.gameService.getUserStats().subscribe({
            next: (stats) => {
                const partida = new Partida();
                Object.assign(partida, {
                    _puntuacio: stats.millor_puntuacio,
                    _duracio_segons: stats.temps_total_jugat,
                    _completada: true
                });
                this.dashboardModel.partides = [partida];
                this.dashboardModel.loading = false;
            },
            error: (error) => {
                this.dashboardModel.error = error.message;
                this.dashboardModel.loading = false;
            }
        });
    }

    onShipSelect(nau: Nau): void {
        if (this.dashboardModel.isNauDisponible(nau)) {
            this.dashboardModel.nauSeleccionada = nau;
        }
    }

    onStartGame(): void {
        if (this.dashboardModel.canPlay()) {
            this.router.navigate(['/game'], {
                state: {
                    nau: this.dashboardModel.nauSeleccionada,
                    usuari: this.dashboardModel.usuari
                }
            });
        }
    }

    onRestoreGame(): void {
        // Implementar lógica de restaurar partida
    }

    onViewStats(): void {
        // Implementar vista de estadísticas
    }

    onLogout(): void {
        this.dashboardModel.clear();
        this.registreService.logout();
        this.router.navigate(['/']);
    }

    formatTime(seconds: number): string {
        return this.dashboardModel.formatTime(seconds);
    }
}