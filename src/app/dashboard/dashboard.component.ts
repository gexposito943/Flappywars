import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { RegistreService } from '../services/registre.service';
import { ShipService } from '../services/ship.service';


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

interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  userStats: UserStats = {
    millor_puntuacio: 0,
    total_partides: 0,
    temps_total_jugat: 0
  };
  statsError: boolean = false;
  selectedShipId: number | null = null;
  userData: UserData = {
    username: 'Usuario',
    nivel: 1,
    puntosTotales: 0,
    naveActual: 1  // X-Wing por defecto
  };
  availableShips: Ship[] = [
    {
      id: 1,
      nom: 'Nau de Combat',
      velocitat: 100,
      imatge_url: 'assets/images/naus/x-wing.png',
      descripcio: 'Nau de combat versàtil'
    },
    {
      id: 2,
      nom: 'Nau Imperial',
      velocitat: 120,
      imatge_url: 'assets/images/naus/tie-fighter.png',
      descripcio: 'Nau ràpida de l\'Imperi'
    },
    {
      id: 3,
      nom: 'Nau Llegendària',
      velocitat: 150,
      imatge_url: 'assets/images/naus/millenium-falcon.png',
      descripcio: 'Nau llegendària'
    }
  ];
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
    const data = this.registreService.getUserData();
    if (data) {
      this.userData = { ...this.userData, ...data };
    }
    this.selectedShipId = this.userData.naveActual || 1;
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
        console.error('Error loading stats:', error);
        this.userStats = { millor_puntuacio: 0, total_partides: 0, temps_total_jugat: 0 };
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
      
      return;
    }
    
    this.gameService.updateUserShip(this.selectedShipId).subscribe({
      next: () => {
        this.router.navigate(['/game']);
      },
      error: (error) => {
        console.error('Error updating ship:', error);
      }
    });
  }

  selectShip(shipId: number) {
    this.selectedShipId = shipId;
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
      error: (error) => {
        console.error('Error loading ships:', error);
      }
    });
  }
}
