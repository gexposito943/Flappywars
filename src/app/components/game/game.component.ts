import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { GameModel } from './models/game.model';
import { Partida } from '../../models/partida.model';
import { Obstacle } from '../../models/obstacle.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  @ViewChild('gameCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private backgroundImage = new Image();
  private shipImage = new Image();
  private obstacleImage = new Image();
  private gameStartTime: number = 0;
  private animationFrameId: number | null = null;
  public model: GameModel;

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.model = new GameModel();
  }

  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
      await this.loadAssets();
      this.startGame();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private async loadAssets() {
    try {
      this.backgroundImage.src = 'assets/images/starwars1.jpeg';
      this.shipImage.src = 'assets/images/naus/x-wing.png';
      this.obstacleImage.src = 'assets/images/obstacles/asteroide.png';

      await Promise.all([
        new Promise(resolve => this.backgroundImage.onload = resolve),
        new Promise(resolve => this.shipImage.onload = resolve),
        new Promise(resolve => this.obstacleImage.onload = resolve)
      ]);
    } catch (error) {
      console.error('Error cargando assets:', error);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    switch(event.code) {
      case 'ArrowUp':
        if (this.model.isGameRunning && !this.model.isPaused) {
          this.model.velocity = this.model.JUMP_FORCE;
        }
        break;
      case 'Space':
        if (this.model.isGameRunning) {
          event.preventDefault();
          this.togglePause();
        }
        break;
      case 'Enter':
        if (!this.model.isGameRunning) {
          event.preventDefault();
          this.startGame();
        }
        break;
    }
  }

  private updateGame(): void {
    if (!this.model.isGameRunning || this.model.isPaused) return;

    // Física básica
    this.model.velocity += this.model.GRAVITY;
    this.model.position = {
      x: this.model.position.x,
      y: this.model.position.y + this.model.velocity
    };

    // Actualizar obstáculos
    this.model.obstacles = this.model.obstacles.map(obs => {
      obs.x -= this.model.OBSTACLE_SPEED;
      if (!obs.passed && obs.x + obs.width < this.model.position.x) {
        obs.passed = true;
        this.model.score += 1;
      }
      return obs;
    });

    // Gestionar obstáculos
    if (this.model.obstacles.length === 0 || 
        this.model.obstacles[this.model.obstacles.length - 1].x < 
        this.model.CANVAS_WIDTH - this.model.OBSTACLE_GAP) {
      this.model.obstacles.push(new Obstacle(this.model.CANVAS_WIDTH));
    }

    // Limpiar obstáculos fuera de pantalla
    this.model.obstacles = this.model.obstacles.filter(obs => obs.x > -obs.width);

    // Verificar colisiones
    if (this.model.checkCollision()) {
      this.gameOver();
    }
  }

  private drawGame(): void {
    this.ctx.clearRect(0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);
    
    // Fondo
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);
    this.ctx.drawImage(this.backgroundImage, 0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);
    
    // Obstáculos
    this.model.obstacles.forEach(obs => {
      this.ctx.drawImage(this.obstacleImage, obs.x, 0, obs.width, obs.topHeight);
      this.ctx.drawImage(
        this.obstacleImage,
        obs.x,
        this.model.CANVAS_HEIGHT - obs.bottomHeight,
        obs.width,
        obs.bottomHeight
      );
    });

    // Nave
    this.ctx.drawImage(
      this.shipImage,
      this.model.position.x,
      this.model.position.y,
      this.model.PLAYER_SIZE,
      this.model.PLAYER_SIZE
    );
  }

  private gameLoop(): void {
    if (!this.model.isGameRunning) return;
    
    if (!this.model.isPaused) {
      this.updateGame();
      this.drawGame();
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  startGame(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.model.reset();
    this.gameStartTime = Date.now();
    this.gameLoop();
  }

  togglePause(): void {
    this.model.isPaused = !this.model.isPaused;
    if (this.model.isPaused) {
      this.model.gameMessage = 'Juego en Pausa';
      this.model.showMessage = true;
    } else {
      this.model.showMessage = false;
    }
  }

  private gameOver(): void {
    this.model.isGameRunning = false;
    this.model.gameMessage = 'Game Over\nPresiona ENTER para volver a jugar';
    this.model.showMessage = true;
    this.saveGameResults(true);
  }

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
                `Game Over! Puntuación: ${this.model.score}` : 
                'Partida guardada! Presiona Espacio para continuar';
              this.model.showMessage = true;
            }
          },
          error: (error) => console.error('Error al guardar la partida:', error)
        });
      },
      error: (error) => console.error('Error al obtener la nave:', error)
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
