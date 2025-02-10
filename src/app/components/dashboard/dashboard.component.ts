import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { ShipService } from '../../services/ship.service';
import { DashboardModel } from './models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  model = new DashboardModel();

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    private shipService: ShipService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  // Cargar dades inicials
  private cargarDatos(): void {
    this.model.loading = true;
    
    // Cargar dades de l'usuari
    const userData = this.registreService.getUserData();
    if (!userData) {
        this.model.error = 'No s\'han trobat dades de l\'usuari';
        this.model.loading = false;
        return;
    }
    
    this.model.usuari = userData;

    // Cargar naus disponibles
    this.shipService.getShips().subscribe({
        next: (ships) => {
            this.model.naus = ships;
            if (this.model.usuari?.id) {  
                this.cargarEstadisticas();
            } else {
                this.model.loading = false;
            }
        },
        error: (error) => {
            console.error('Error carregant naus:', error);
            this.model.error = 'Error carregant naus';
            this.model.loading = false;
        }
    });
  }

  // Cargar estadístiques de l'usuari
  private cargarEstadisticas(): void {
    if (!this.model.usuari?.id) {
        this.model.loading = false;
        return;
    }

    this.gameService.getUserStats(this.model.usuari.id).subscribe({
        next: (response) => {
            if (response?.success && response?.estadistiques) {
                const stats = response.estadistiques;
                
                // Actualitzar nivell i punts de l'usuari
                this.model.usuari.nivell = stats.general.nivell_actual;
                this.model.usuari.punts_totals = stats.general.punts_totals;
                
                // Actualitzar estadístiques
                this.model.stats = {
                    punts_totals: stats.general.punts_totals,
                    millor_puntuacio: stats.partides?.millor_puntuacio || 0,
                    total_partides: stats.partides?.total_partides || 0,
                    temps_total_jugat: stats.partides?.temps_total_jugat || 0
                };
            }
            this.model.loading = false;
        },
        error: (error) => {
            console.error('Error carregant estadístiques:', error);
            this.model.error = 'Error carregant estadístiques';
            this.model.loading = false;
        }
    });
  }

  // Accions de l'usuari
  onShipSelect(nau: any): void {
    if (this.model.isNauDisponible(nau)) {
      this.model.nauSeleccionada = nau;
    }
  }

  onStartGame(): void {
    if (this.model.canPlay()) {
      this.router.navigate(['/game'], {
        state: {
          nau: this.model.nauSeleccionada,
          usuari: this.model.usuari
        }
      });
    }
  }

  onViewStats(): void {
    this.router.navigate(['/estadistiques'], {
      state: {
        usuari: this.model.usuari,
        stats: this.model.stats
      }
    });
  }

  onResetPoints(): void {
    if (confirm('¿Segur que vols reiniciar els teus punts a 0?')) {
      this.gameService.resetUserPoints(this.model.usuari.id).subscribe({
        next: () => {
          this.model.stats.punts_totals = 0;
          this.model.usuari.punts_totals = 0;
          alert('Punts reiniciats correctament');
        },
        error: (error) => {
          console.error('Error:', error);
          alert('Error al reiniciar punts');
        }
      });
    }
  }

  onLogout(): void {
    this.registreService.logout();
    this.router.navigate(['/']);
  }

  // Helper per formatejar temps
  formatTime(seconds: number): string {
    return this.model.formatTime(seconds);
  }
}