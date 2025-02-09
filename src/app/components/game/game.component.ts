import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { BaseGame } from './models/base-game.model';
import { Partida } from '../../models/partida.model';

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
      await this.assets.loadAll();
      this.startGame();
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
    this.model.gameMessage = 'Game Over\nPrem ENTER per tornar a jugar';
    this.model.showMessage = true;
    this.saveGameResults(true);
  }

  //Guarda els resultats de la partida
  public saveGameResults(completed: boolean = false): void {
    const partida = new Partida();
    const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);

    this.gameService.getUserShip().subscribe({
      next: (shipResponse) => {
        partida.nau_utilitzada = shipResponse?.success && shipResponse?.data?.id ? 
          shipResponse.data.id : '1';
        partida.usuari_id = this.registreService.getUserId() || '0';
        partida.puntuacio = this.model.score;
        partida.duracio_segons = gameTime;
        partida.obstacles_superats = this.model.score;
        partida.completada = completed ? 1 : 0;
        partida.posicioX = this.model.position.x;
        partida.posicioY = this.model.position.y;
        partida.obstacles = this.model.obstacles.map(obs => ({
          posicioX: obs.x,
          posicioY: obs.topHeight
        }));

        this.gameService.saveGameResults(partida).subscribe({
          next: (response) => {
            if (response.success) {
              this.model.gameMessage = completed ? 
                `Game Over! Puntuació: ${this.model.score}` : 
                'Partida guardada! Prem Espai per continuar';
              this.model.showMessage = true;
            }
          },
          error: (error) => console.error('Error al guardar la partida:', error)
        });
      },
      error: (error) => console.error('Error al obtenir la nau:', error)
    });
  }

  //Navega al dashboard
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

}
