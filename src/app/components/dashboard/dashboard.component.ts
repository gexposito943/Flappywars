import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ShipService } from '../../services/ship.service';
import { RegistreService } from '../../services/registre.service';
import { GameService } from '../../services/game.service';


interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
  punts_totals: number;
}

interface Ship {
  id: string;
  nom: string;
  velocitat: number;
  imatge_url: string;
  descripcio: string;
  punts_requerits: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  userData: any = null;
  ships: Ship[] = [];
  selectedShip: Ship | null = null;
  stats: UserStats = {
    millor_puntuacio: 0,
    total_partides: 0,
    temps_total_jugat: 0,
    punts_totals: 0
  };
  loading = false;
  error: string | null = null;
  hasSavedGame = false;

  constructor(
    private router: Router,
    private registreService: RegistreService,
    private gameService: GameService,
    private shipService: ShipService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadShips();
    this.loadStats();
    this.checkSavedGame();
  }

  private loadUserData(): void {
    const userData = this.registreService.getUserData();
    if (!userData) {
      this.router.navigate(['/']);
      return;
    }
    this.userData = userData;
  }

  private loadShips(): void {
    this.loading = true;
    this.shipService.getShips().subscribe({
      next: (ships) => {
        console.log('Todas las naves recibidas:', ships);
        this.ships = ships;
        const defaultShip = ships.find(ship => ship.punts_requerits === 0);
        if (defaultShip) {
          this.selectedShip = defaultShip;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando naves:', error);
        this.loading = false;
      }
    });
  }

  private loadStats(): void {
    this.loading = true;
    this.gameService.getUserStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.error = 'Error carregant les estadístiques';
        this.loading = false;
      }
    });
  }

  private checkSavedGame(): void {
    this.gameService.checkSavedGame(this.userData?.id).subscribe({
      next: (hasSaved) => this.hasSavedGame = hasSaved,
      error: (error) => console.error('Error checking saved game:', error)
    });
  }

  isShipAvailable(ship: Ship): boolean {
    const userPoints = this.userData?.punts_totals || 0;
    return userPoints >= ship.punts_requerits;
  }

  selectShip(ship: Ship): void {
    if (this.isShipAvailable(ship)) {
      this.selectedShip = ship;
    }
  }

  onStartGame(): void {
    if (this.selectedShip) {
      this.router.navigate(['/game'], {
        state: { ship: this.selectedShip, user: this.userData }
      });
    }
  }

  onRestoreGame(): void {
    if (this.hasSavedGame) {
      this.router.navigate(['/game'], {
        state: { 
          restore: true,
          user: this.userData 
        }
      });
    }
  }

  onResetPoints(): void {
    if (confirm('Estàs segur que vols reiniciar els teus punts a 0? Aquesta acció no es pot desfer.')) {
      this.loading = true;
      this.gameService.resetUserPoints(this.userData.id).subscribe({
        next: () => {
          this.userData.punts_totals = 0;
          this.stats.punts_totals = 0;
          this.loadShips(); // Recargar naves ya que pueden cambiar las disponibles
          this.loading = false;
          alert('Els teus punts han estat reiniciats correctament.');
        },
        error: (error) => {
          console.error('Error resetting points:', error);
          this.error = 'Error reiniciant els punts';
          this.loading = false;
        }
      });
    }
  }

  onViewStats(): void {
    this.router.navigate(['/estadistiques'], {
      state: {
        usuari: this.userData,
        stats: this.stats
      }
    });
  }

  onLogout(): void {
    this.registreService.logout();
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}