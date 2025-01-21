import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { RegistreService } from '../services/registre.service';

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
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- Capçalera del perfil -->
      <header class="profile-header">
        <div class="user-info">
          <h1>Benvingut, {{ userData.username }}!</h1>
          <div class="user-level">
            Nivell: <span>{{ userData.nivel }}</span>
            <div class="points">Punts: {{ userData.puntosTotales }}</div>
          </div>
        </div>
        <button class="logout-button" (click)="logout()">Sortir</button>
      </header>

      <!-- Estadístiques de l'usuari -->
      <section class="stats-section">
        <h2>Les Teves Estadístiques</h2>
        <div class="stats-grid" *ngIf="userStats; else errorTpl">
          <div class="stat-card">
            <h3>Millor Puntuació</h3>
            <p>{{ userStats.millor_puntuacio }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Partides</h3>
            <p>{{ userStats.total_partides }}</p>
          </div>
          <div class="stat-card">
            <h3>Temps Total Jugat</h3>
            <p>{{ formatTime(userStats.temps_total_jugat) }}</p>
          </div>
        </div>
        <ng-template #errorTpl>
          <p class="error-message" *ngIf="statsError">
            Error carregant les estadístiques
          </p>
        </ng-template>
      </section>

      <!-- Secció de navegació -->
      <section class="navigation-section">
        <div class="nav-controls">
          <button 
            class="play-button"
            [disabled]="!selectedShipId" 
            (click)="startGame()"
            [class.disabled]="!selectedShipId">
            {{ !selectedShipId ? 'Selecciona una nau primer' : 'Començar Partida' }}
          </button>
          
          <div class="ship-selection-message" *ngIf="!selectedShipId">
            Has de seleccionar una nau abans de començar
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .stats-section {
      padding: 20px;
      background: #f5f5f5;
      border-radius: 8px;
      margin: 20px 0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .stat-card {
      background: white;
      padding: 15px;
      border-radius: 4px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .error-message {
      color: red;
      text-align: center;
      padding: 10px;
    }
    .navigation-section {
      margin-top: 20px;
      text-align: center;
    }
    .play-button {
      padding: 15px 30px;
      font-size: 1.2em;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .play-button:hover:not(.disabled) {
      background-color: #45a049;
    }
    .play-button.disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .ship-selection-message {
      color: #f44336;
      margin-top: 10px;
      font-size: 0.9em;
    }
    .profile-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: #2a2a3e;
      color: white;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .user-info {
      h1 {
        margin: 0;
        font-size: 1.5em;
      }
    }
    .user-level {
      display: flex;
      gap: 20px;
      margin-top: 10px;
      font-size: 1.1em;
    }
    .logout-button {
      padding: 10px 20px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .logout-button:hover {
      background: #d32f2f;
    }
  `]
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
  availableShips: Ship[] = [];
  achievements: Achievement[] = [];

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService
  ) {}

  ngOnInit() {
    this.userData = this.registreService.getUserData();
    this.loadUserStats();
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
    if (this.userData) {
      this.userData.naveActual = shipId;
    }
    this.gameService.updateUserShip(shipId).subscribe();
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
}
