import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { RegistreService } from '../services/registre.service';
import { ShipService } from '../services/ship.service';

interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
}

interface UserData {
  username: string;
  nivel: number;
  puntosTotales: number;
  naveActual?: number;
}

export interface Ship {
  id: number;
  nom: string;
  velocitat: number;
  imatge_url: string;
  descripcio: string;
}

interface Achievement {
  id: number;
  nom: string;
  completat: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  userStats?: UserStats;
  statsError: boolean = false;
  selectedShipId: number | null = null;
  userData: UserData = {
    username: '',
    nivel: 1,
    puntosTotales: 0
  };
  availableShips: any[] = [];
  achievements: Achievement[] = [];
  ships: any[] = [];
  selectedShip: any;

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    private shipService: ShipService
  ) {}

  ngOnInit() {
    this.userData = this.registreService.getUserData();
    this.loadUserStats();
    this.loadShips();
  }

  loadUserStats() {
    this.gameService.getUserStats().subscribe({
      next: (stats) => {
        this.userStats = stats;
        this.statsError = false;
      },
      error: (error) => {
        console.error('Error carregant estadístiques:', error);
        this.userStats = undefined;
        this.statsError = true;
      }
    });
  }

  logout() {
    this.registreService.logout();
    this.router.navigate(['/']);
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  startGame() {
    if (!this.selectedShipId) {
      return; // No fer res si no hi ha nau seleccionada
    }
    
    // Guardar la nau seleccionada abans de començar
    this.gameService.updateUserShip(this.selectedShipId).subscribe({
      next: () => {
        // Navegar al component del joc
        this.router.navigate(['/game']);
      },
      error: (error) => {
        console.error('Error actualitzant la nau:', error);
      }
    });
  }

  // Mètode auxiliar per comprovar si es pot començar el joc
  canStartGame(): boolean {
    return this.selectedShipId !== null;
  }

  selectShip(shipId: number) {
    this.selectedShipId = shipId;
    this.gameService.updateUserShip(shipId);
  }

  updateUserData() {
    const data = this.registreService.getUserData();
    if (data) {
      this.userData = data;
      this.selectedShipId = data.naveActual;
    }
  }

  loadAchievements() {
    this.gameService.getUserAchievements().subscribe(achievements => {
      this.achievements = achievements;
    });
  }

  loadShips() {
    this.shipService.getShips().subscribe({
      next: (ships) => {
        this.availableShips = ships;
      },
      error: (error: Error) => {
        console.error('Error fetching ships:', error);
      }
    });
  }
}
