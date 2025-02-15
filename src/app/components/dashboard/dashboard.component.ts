import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { ShipService } from '../../services/ship.service';
import { DashboardModel } from './models/dashboard.model';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { UserData } from '../../interfaces/user-data.interface';
import { Nau } from '../../interfaces/nau.interface';
import { catchError, tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

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
    const userData = this.registreService.getUserData();
    if (!userData) {
      this.router.navigate(['/']);
      return;
    }
    this.initializeDashboard(userData);
  }

  private async initializeDashboard(userData: UserData): Promise<void> {
    this.model.loading = true;
    this.model.usuari = userData;

    try {
      await this.loadInitialData(userData.id);
    } catch {
      this.model.error = 'Error carregant dades';
    } finally {
      this.model.loading = false;
    }
  }

  private async loadInitialData(userId: string): Promise<void> {
    const [ships, stats] = await Promise.all([
      firstValueFrom(this.shipService.getShips()),
      firstValueFrom(this.gameService.getUserStats(userId))
    ]);

    this.model.naus = ships;
    if (stats?.estadistiques) {
      this.updateStats(stats);
    }
    await this.loadCurrentShip();
  }

  private updateStats(response: ApiResponse): void {
    if (!response?.estadistiques) {
      console.log('No hay estadísticas en la respuesta:', response);
      return;
    }

    const { general, partides } = response.estadistiques;
    
    Object.assign(this.model.stats, {
      punts_totals: general.punts_totals,
      millor_puntuacio: partides.millor_puntuacio,
      total_partides: partides.total_partides,
      temps_total_jugat: partides.temps_total_jugat
    });

    if (this.model.usuari) {
      this.model.usuari.nivell = {
        ...general.nivell_actual,
        imatge_url: general.nivell_actual.imatge
      };
      this.model.usuari.punts_totals = general.punts_totals;
    }

    console.log('Stats actualizadas:', this.model.stats);
  }

  onShipSelect(nau: Nau): void {
    if (!this.model.isNauDisponible(nau) || !this.model.usuari?.id) return;

    this.shipService.updateUserShip(this.model.usuari.id, nau.id)
      .pipe(
        tap(() => {
          this.model.nauSeleccionada = nau;
          if (this.model.usuari) {
            this.model.usuari.nau_actual = nau;
          }
        }),
        catchError(err => {
          this.model.error = 'Error al actualizar la nau';
          throw err;
        })
      )
      .subscribe();
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

  onResetPoints(): void {
    if (!this.model.usuari?.id || !confirm('Segur que vols reiniciar els teus punts a 0?')) return;

    this.gameService.resetUserPoints(this.model.usuari.id)
      .pipe(
        tap(() => {
          this.model.resetStats();
          alert('Punts reiniciats correctament');
        }),
        catchError(() => {
          alert('Error al reiniciar punts');
          throw new Error('Reset points failed');
        })
      )
      .subscribe();
  }

  onLogout(): void {
    this.registreService.logout();
    this.router.navigate(['/']);
  }

  onViewStats(): void {
    this.router.navigate(['/estadistiques'], {
      state: {
        usuari: this.model.usuari,
        ...this.model.stats
      }
    });
  }

  formatTime(seconds: number): string {
    return this.model.formatTime(seconds);
  }

  private async loadCurrentShip(): Promise<void> {
    try {
      const response = await firstValueFrom(this.gameService.getUserShip());
      if (response?.nau) {
        this.model.nauSeleccionada = this.model.naus.find(n => n.id === response.nau.id) || null;
      }
    } catch (error) {
      console.error('Error al carregar la nau actual:', error);
    }
  }

  onViewProfile(): void {
    this.router.navigate(['/profile']);
  }
}