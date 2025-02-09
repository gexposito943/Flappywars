import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { DashboardModel } from './models/dashboard.model';
import { Nau, Usuari, Nivell } from '../../models';
import { ApiResponse, UserStats, UserData, Nivell as NivellInterface } from '../../interfaces/stats.interface';
import { ShipService } from '../../services/ship.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  dashboardModel = new DashboardModel();

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    private shipService: ShipService
  ) {}

  ngOnInit(): void {
    this.initializeDashboard();
  }

  private async initializeDashboard(): Promise<void> {
    this.dashboardModel.loading = true;
    try {
      await this.loadUserData();
      await this.loadGameData();
    } catch (error) {
      this.dashboardModel.error = 'Error carregant dades';
    } finally {
      this.dashboardModel.loading = false;
    }
  }

  private async loadUserData(): Promise<void> {
    const userData = this.registreService.getUserData();
    console.log('userData completo:', userData);

    if (userData) {
        const nivell = new Nivell(
            '1',
            'Novell',
            '/assets/images/nivells/novell.png',
            userData.nivell || 0
        );

        const usuari = new Usuari(
            userData.id,
            userData.nom_usuari,
            userData.email,
            nivell,
            userData.punts_totals,
            new Date(userData.data_registre),
            userData.ultim_acces ? new Date(userData.ultim_acces) : null,
            userData.estat,
            userData.intents_login,
            userData.nau_actual
        );

        // Añadir estadísticas si existen
        if (userData.estadistiques) {
            usuari.estadistiques = {
                millor_puntuacio: userData.estadistiques.millor_puntuacio || 0,
                total_partides: userData.estadistiques.total_partides || 0,
                temps_total_jugat: userData.estadistiques.temps_total_jugat || 0
            };
        }

        this.dashboardModel.usuari = usuari;
    }
  }

  private async loadGameData(): Promise<void> {
    try {
      // Primero cargar las naves
      this.shipService.getShips().subscribe({
        next: (ships) => {
          console.log('Naves recibidas:', ships);
          this.dashboardModel.naus = ships.map(ship => new Nau(
            ship.id,
            ship.nom,
            ship.velocitat,
            ship.imatge_url,
            ship.descripcio,
            true,
            new Date(),
            ship.punts_requerits
          ));
        },
        error: (error) => {
          console.error('Error cargando naves:', error);
          this.dashboardModel.error = 'Error carregant les naus';
        }
      });

      // Luego cargar las estadísticas
      this.gameService.getUserStats(this.dashboardModel.usuari.id).subscribe({
        next: (statsResponse) => {
          if (statsResponse?.success && statsResponse?.estadistiques) {
            const stats = statsResponse.estadistiques;
            this.dashboardModel.stats.punts_totals = stats.general?.punts_totals || 0;
            this.dashboardModel.stats.millor_puntuacio = stats.partides?.millor_puntuacio || 0;
            this.dashboardModel.stats.total_partides = stats.partides?.total_partides || 0;
            this.dashboardModel.stats.temps_total_jugat = stats.partides?.temps_total_jugat || 0;
            
            if (stats.general?.nivell_actual) {
              const nivellActual = stats.general.nivell_actual;
              this.dashboardModel.usuari.nivell = new Nivell(
                nivellActual.nivell.toString(),
                nivellActual.nom,
                nivellActual.imatge,
                stats.general.punts_totals
              );
            }
            
            console.log('Estadísticas cargadas:', this.dashboardModel.stats);
          }
        },
        error: (error) => {
          console.error('Error cargando estadísticas:', error);
          this.dashboardModel.error = 'Error carregant les estadístiques';
        }
      });
    } catch (error) {
      console.error('Error general:', error);
      this.dashboardModel.error = 'Error carregant les dades del joc';
    }
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
    if (this.dashboardModel.hasSavedGame) {
      this.router.navigate(['/game'], { 
        state: { 
          restore: true,
          usuari: this.dashboardModel.usuari 
        }
      });
    }
  }

  onResetPoints(): void {
    if (!confirm('Estàs segur que vols reiniciar els teus punts a 0? Aquesta acció no es pot desfer.')) {
      return;
    }

    this.dashboardModel.loading = true;
    this.gameService.resetUserPoints(this.dashboardModel.usuari.id).subscribe({
      next: () => this.handleResetPointsSuccess(),
      error: (error) => this.handleResetPointsError(error)
    });
  }

  private handleResetPointsSuccess(): void {
    this.dashboardModel.usuari.punts_totals = 0;
    this.dashboardModel.stats.punts_totals = 0;
    this.initializeDashboard();
    alert('Els teus punts han estat reiniciats correctament.');
  }

  private handleResetPointsError(error: any): void {
    console.error('Error resetting points:', error);
    this.dashboardModel.error = 'Error reiniciant els punts';
    this.dashboardModel.loading = false;
  }

  onViewStats(): void {
    this.router.navigate(['/estadistiques'], {
      state: {
        usuari: this.dashboardModel.usuari,
        stats: this.dashboardModel.stats
      }
    });
  }

  onLogout(): void {
    this.registreService.logout();
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    return this.dashboardModel.formatTime(seconds);
  }
}