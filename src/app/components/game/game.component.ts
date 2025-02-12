import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { BaseGame } from './models/base-game.model';
import { Partida } from '../../models/partida.model';
import { UserStats } from '../../interfaces/stats.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent extends BaseGame implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) 
  private canvas!: ElementRef<HTMLCanvasElement>;
  
  private gameStartTime: number = 0;
  private currentShip: any = null;

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    super(platformId);
  }

  //Inicialitza el joc
  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const context = this.canvas.nativeElement.getContext('2d');
      if (!context) return;

      this.initRenderer(context);

      try {
        // Primero cargamos la nave actual
        const shipResponse = await firstValueFrom(this.gameService.getUserShip());
        console.log('Nave cargada en el juego:', shipResponse);
        
        if (shipResponse?.nau) {
          this.currentShip = shipResponse.nau;
          // Actualizar la imagen de la nave
          await this.assets.updateShipImage(this.currentShip.imatge_url);
        }

        // Luego cargamos el resto de assets
        await this.assets.loadAll();
        this.startGame();

      } catch (error) {
        console.error('Error al inicializar el juego:', error);
      }
    }
  }

  
  //Neteja els recursos en destruir el component
  ngOnDestroy() {
    this.stopGameLoop();
  }

  
  // Gestiona els events del teclat
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch(event.code) {
      case 'ArrowUp':
        if (this.model.isGameRunning && !this.model.isPaused) {
          this.model.jump();
        }
        break;
      case 'Space':
        if (this.model.isGameRunning) {
          event.preventDefault();
          this.togglePause();
        }
        break;
      case 'Enter':
        event.preventDefault();
        this.startGame();
        break;
    }
  }

  //Inicia una nova partida
  startGame(): void {
    this.model.reset();
    this.gameStartTime = Date.now();
    this.startGameLoop();
  }


  //Pausa/Despausa el joc
  togglePause(): void {
    this.model.isPaused = !this.model.isPaused;
    if (this.model.isPaused) {
      this.model.gameMessage = 'Joc en Pausa';
      this.model.showMessage = true;
    } else {
      this.model.showMessage = false;
    }
  }

  //Gestiona el final de la partida
  protected override onGameOver(): void {
    this.model.isGameRunning = false;
    this.saveGameResults(true);
  }

  //Guarda els resultats de la partida
  public saveGameResults(completed: boolean = false): void {
    const partida = new Partida();
    const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);

    console.log('Iniciando guardado de la partida');

    this.gameService.getUserShip().subscribe({
      next: (shipResponse) => {
        console.log('Respuesta nave:', shipResponse); 

        // La respuesta viene como { success: true, nau: {...} }
        if (!shipResponse?.nau?.id) {
          console.error('No se pudo obtener la nave, intentando obtener nave por defecto');
          this.gameService.getDefaultShip().subscribe({
            next: (defaultShip) => {
              if (defaultShip?.success && defaultShip?.data?.id) {
                this.savePartida(defaultShip.data.id, completed, gameTime);
              }
            }
          });
          return;
        }

        this.savePartida(shipResponse.nau.id, completed, gameTime);
      },
      error: (error) => console.error('Error al obtener la nave:', error)
    });
  }

  private savePartida(shipId: string, completed: boolean, gameTime: number): void {
    const partida = new Partida();
    
    partida.usuari_id = this.registreService.getUserId() || '';
    partida.nau_utilitzada = shipId;
    partida.puntuacio = this.model.score;
    partida.duracio_segons = gameTime;
    partida.obstacles_superats = this.model.score;
    partida.completada = completed ? 1 : 0;
    partida.posicioX = Math.round(this.model.position.x);
    partida.posicioY = Math.round(this.model.position.y);
    
    // Log para debug
    console.log('Datos a guardar:', partida);

    this.gameService.saveGameResults(partida).subscribe({
      next: (response) => {
        console.log('Respuesta guardado:', response); // Log para debug
        if (response.success) {
          if (!completed) {
            this.model.gameMessage = 'Partida guardada correctament';
            this.model.showMessage = true;
            setTimeout(() => this.goToDashboard(), 2000);
          } else {
            this.model.gameMessage = `Game Over! Puntuació: ${this.model.score}`;
            this.model.showMessage = true;
          }
        }
      },
      error: (error) => {
        console.error('Error al guardar la partida:', error);
        this.model.gameMessage = 'Error al guardar la partida';
        this.model.showMessage = true;
      }
    });
  }

  // Método para actualizar estadísticas
  private updateUserStats(partida: Partida): void {
    const stats: UserStats = {
      puntuacio: partida.puntuacio,
      temps_jugat: partida.duracio_segons,
      obstacles_superats: partida.obstacles_superats,
      millor_puntuacio: partida.puntuacio,
      total_partides: 1,
      temps_total_jugat: partida.duracio_segons,
      punts_totals: partida.puntuacio,
      nivell: 1
    };

    this.gameService.updateUserStats(stats).subscribe({
      next: (response) => console.log('Estadísticas actualizadas:', response),
      error: (error) => console.error('Error al actualizar estadísticas:', error)
    });
  }

  //Navega al dashboard
  public goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

}
