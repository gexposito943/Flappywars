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
  required_points: number;
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
      descripcio: 'Nau de combat versàtil',
      required_points: 0
    },
    {
      id: 2,
      nom: 'Nau Imperial',
      velocitat: 120,
      imatge_url: 'assets/images/naus/tie-fighter.png',
      descripcio: 'Nau ràpida de l\'Imperi',
      required_points: 1000
    },
    {
      id: 3,
      nom: 'Nau Llegendària',
      velocitat: 150,
      imatge_url: 'assets/images/naus/millenium-falcon.png',
      descripcio: 'Nau llegendària',
      required_points: 2500
    }
  ];
  achievements: Achievement[] = [];
  ships: any[] = [];
  selectedShip: any;
  loading: boolean = true;

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    private shipService: ShipService
  ) {}

  ngOnInit() {
    this.loading = true;
    
    const data = this.registreService.getUserData();
    if (data) {
      this.userData = { ...this.userData, ...data };
    }
    
    // Inicialmente ninguna nave seleccionada
    this.selectedShipId = null;
    
    this.loadUserStats();
    
    this.loading = false;
  }

  loadUserStats() {
    this.gameService.getUserStats().subscribe({
      next: (stats) => {
        console.log('Estadísticas cargadas:', stats);
        this.userStats = {
          millor_puntuacio: stats?.millor_puntuacio || 0,
          total_partides: stats?.total_partides || 0,
          temps_total_jugat: stats?.temps_total_jugat || 0
        };
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.userStats = {
          millor_puntuacio: 0,
          total_partides: 0,
          temps_total_jugat: 0
        };
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
    console.log('Iniciando juego con nave:', this.selectedShipId);
    if (this.selectedShipId) {
      // Navegamos directamente al juego sin llamar a la API
      this.router.navigate(['/game'], {
        state: { 
          shipId: this.selectedShipId,
          userData: this.userData
        }
      });
    } else {
      console.log('No hay nave seleccionada');
    }
  }

  selectShip(shipId: number) {
    const ship = this.availableShips.find(s => s.id === shipId);
    if (ship && this.isShipUnlocked(ship)) {
      this.selectedShipId = shipId;
      console.log('Nave seleccionada:', shipId);
      
      // Actualizar el estado inmediatamente
      this.userData = {
        ...this.userData,
        naveActual: shipId
      };
      
      // Guardar en el servicio
      this.registreService.setUserData(this.userData);
    }
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
    console.log('Naves disponibles:', this.availableShips);
  }

  isShipUnlocked(ship: Ship): boolean {
    const isUnlocked = this.userData.puntosTotales >= ship.required_points;
    console.log(`Nave ${ship.id} desbloqueada:`, isUnlocked);
    return isUnlocked;
  }
}
