import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { GameService } from '../services/game.service';
import { RegistreService } from '../services/registre.service';
import { ShipService } from '../services/ship.service';
import { filter } from 'rxjs/operators';


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
  punts_totals: number;
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
    temps_total_jugat: 0,
    punts_totals: 0
  };
  statsError: boolean = false;
  selectedShipId: number | null = null;
  userData: UserData = {
    username: 'Usuario',
    nivel: 1,
    puntosTotales: 0,
    naveActual: 1  // X-Wing per defecte
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
    
    this.selectedShipId = null;
    this.loadUserStats();
    
    // Recarga estadistiques quan tornem al dashboard
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadUserStats();
    });
  }

  loadUserStats() {
    console.log('Cargando estadísticas...');
    this.gameService.getUserStats().subscribe({
      next: (stats) => {
        console.log('Estadísticas recibidas:', stats);
        if (stats) {
          this.userStats = {
            millor_puntuacio: stats.millor_puntuacio || 0,
            total_partides: stats.total_partides || 0,
            temps_total_jugat: stats.temps_total_jugat || 0,
            punts_totals: stats.punts_totals || 0
          };
          this.userData = {
            ...this.userData,
            puntosTotales: stats.punts_totals || 0
          };
          this.registreService.setUserData(this.userData);
        }
        this.statsError = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
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
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  startGame() {
    console.log('Iniciando juego con nave:', this.selectedShipId);
    if (this.selectedShipId) {
      // Navegamos directament al joc sense cridar a l'API
      this.router.navigate(['/game'], {
        state: { 
          shipId: this.selectedShipId,
          userData: this.userData
        }
      });
    } else {
      console.log('No hi ha nau seleccionada');
    }
  }

  selectShip(shipId: number) {
    const ship = this.availableShips.find(s => s.id === shipId);
    if (ship && this.isShipUnlocked(ship)) {
      this.selectedShipId = shipId;
      console.log('Nau seleccionada:', shipId);
      
      // Actualitzar l'estat immediatament
      this.userData = {
        ...this.userData,
        naveActual: shipId
      };
      
      // Guardar en el servei
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
    console.log('Naus disponibles:', this.availableShips);
  }

  isShipUnlocked(ship: Ship): boolean {
    
    const isUnlocked = this.userData.puntosTotales >= ship.required_points;
    // Log per a depuració
    console.log(`Verificant nau ${ship.nom}:`);
    console.log(`- Punts necessaris: ${ship.required_points}`);
    console.log(`- Punts usuari: ${this.userData.puntosTotales}`);
    console.log(`- Desbloquejada: ${isUnlocked}`);
    
    return isUnlocked;
  }

  hasSavedGame(): boolean {
    return this.gameService.hasSavedGame();
  }

  restoreGame(): void {
    this.gameService.restoreGame().subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/game'], {
            state: {
              restored: true,
              gameState: response.gameState
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al resutaurar partida:', error);
      }
    });
  }

  viewGlobalStats(): void {
    this.router.navigate(['/estadistiques']);
  }
}
