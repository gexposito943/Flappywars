/**
 * Component principal del joc
 * Gestiona la interfície d'usuari i delega la lògica al controlador
 */
import { Component, ElementRef, ViewChild, OnInit, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GameService, GameResult } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { GameModel } from './models/game.model';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private backgroundImage: HTMLImageElement;
  private playerImage: HTMLImageElement;
  private imagesLoaded: boolean = false;
  private gameLoop: any = null;
  private gameStartTime: number = 0;
  private _model: GameModel;
  private defaultShipId: string = ''; 
  private defaultObstacleImage: string = ''; 

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._model = new GameModel();
    this.backgroundImage = new Image();
    this.playerImage = new Image();
    
    if (isPlatformBrowser(this.platformId)) {
      this.loadGameAssets();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCanvas();
      this.startGameLoop();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this._model.isGameRunning) {
      this.startGame();
    }
    if (event.key === 'ArrowUp' && this._model.isGameRunning) {
      this.jump();
    }
    if (event.key === ' ') {
      event.preventDefault();
      if (this._model.isGameRunning) {
        this.togglePause();
      }
    }
  }

  private initializeCanvas() {
    const context = this.canvas?.nativeElement.getContext('2d');
    if (!context) {
      console.error('Could not get 2D context');
      return;
    }
    this.ctx = context;
  }

  private async loadGameAssets(): Promise<void> {
    try {
      // Cargar la nave X-Wing
      const defaultShip = await this.gameService.getNau().toPromise();
      if (defaultShip) {
        this.playerImage.src = defaultShip.imatge_url;
        this.defaultShipId = defaultShip.id;
      }

      // Cargar el obstáculo por defecto
      const defaultObstacle = await this.gameService.getObstacle().toPromise();
      if (defaultObstacle) {
        this.defaultObstacleImage = defaultObstacle.imatge_url;
      }

      // Cargar el fondo
      this.backgroundImage.src = 'assets/images/starwars1.jpeg';
      
      this.imagesLoaded = true;
    } catch (error) {
      console.error('Error loading game assets:', error);
    }
  }

  startGame(): void {
    if (this._model.isGameRunning) return;
    
    this._model.reset();
    this.gameStartTime = Date.now();
    this.gameLoop = setInterval(() => this.updateGame(), 1000 / 60);
  }

  private updateGame(): void {
    if (this._model.isPaused || !this._model.isGameRunning) return;

    this.applyGravity();
    this.moveObstacles();
    this.updateScore();
    
    if (this._model.checkCollision()) {
      this.stopGame();
      return;
    }
    
    this.manageObstacles();
  }

  private applyGravity(): void {
    this._model.player.velocity += this._model.GRAVITY;
    this._model.player.y += this._model.player.velocity;

    // Límites del canvas
    if (this._model.player.y < 0) {
      this._model.player.y = 0;
      this._model.player.velocity = 0;
    }
    if (this._model.player.y > this._model.CANVAS_HEIGHT - this._model.player.size) {
      this._model.player.y = this._model.CANVAS_HEIGHT - this._model.player.size;
      this._model.player.velocity = 0;
    }
  }

  private moveObstacles(): void {
    this._model.obstacles = this._model.obstacles.map(obstacle => {
      obstacle.x -= this._model.OBSTACLE_SPEED;
      return obstacle;
    });
  }

  private updateScore(): void {
    const passedObstacle = this._model.obstacles.find(obstacle => 
      obstacle.x + obstacle.width < this._model.player.x && !obstacle.passed
    );
    if (passedObstacle) {
      this._model.score++;
      passedObstacle.passed = true;
    }
  }

  private manageObstacles(): void {
    if (this._model.obstacles.length === 0 || 
      this._model.obstacles[this._model.obstacles.length - 1].x < this._model.CANVAS_WIDTH - this._model.OBSTACLE_GAP) {
      this._model.obstacles.push(this._model.createObstacle());
    }
    
    this._model.obstacles = this._model.obstacles.filter(obstacle => 
      obstacle.x > -obstacle.width
    );
  }

  jump(): void {
    if (!this._model.isGameRunning) return;
    this._model.player.velocity = this._model.JUMP_FORCE;
  }

  stopGame(): void {
    this._model.isGameRunning = false;
    this._model.showMessage = true;
    this._model.gameMessage = `Game Over - Puntuació: ${this._model.score}`;
    
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    
    this.saveGameResults();
  }

  togglePause(): void {
    this._model.isPaused = !this._model.isPaused;
  }

  public saveGameResults(): void {
    const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    
    const gameResult: GameResult = {
      usuari_id: parseInt(this.registreService.getUserId() || '0'),
      puntuacio: this._model.score,
      duracio_segons: gameTime,
      nau_utilitzada: parseInt(this.defaultShipId || '0'),
      nivell_dificultat: 'normal',
      obstacles_superats: this._model.score,
      completada: true
    };

    this.gameService.saveGameResults(gameResult).subscribe({
      next: () => {
        this._model.gameMessage = 'Partida guardada! Prem Enter per tornar a jugar';
      },
      error: () => {
        this._model.gameMessage = 'Error al guardar la partida';
      }
    });
  }

  goToDashboard(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.router.navigate(['/dashboard']);
  }

  private startGameLoop(): void {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => this.drawGame());
    }
  }

  private drawGame(): void {
    if (!this.ctx || !this.imagesLoaded) return;

    this.ctx.clearRect(0, 0, this._model.CANVAS_WIDTH, this._model.CANVAS_HEIGHT);
    
    if (this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this._model.CANVAS_WIDTH, this._model.CANVAS_HEIGHT);
    }

    if (this._model.isGameRunning) {
      this.drawObstacles();
      if (this.playerImage.complete) {
        this.ctx.drawImage(
          this.playerImage,
          this._model.player.x,
          this._model.player.y,
          this._model.player.size,
          this._model.player.size
        );
      }
    }

    requestAnimationFrame(() => this.drawGame());
  }

  private drawObstacles(): void {
    this.ctx.fillStyle = '#2ecc71';
    this.ctx.strokeStyle = '#27ae60';
    this.ctx.lineWidth = 3;

    this._model.obstacles.forEach(obstacle => {
      // Dibujar obstáculo superior
      this.ctx.fillRect(obstacle.x, 0, obstacle.width, obstacle.topHeight);
      this.ctx.strokeRect(obstacle.x, 0, obstacle.width, obstacle.topHeight);

      // Dibujar obstáculo inferior
      this.ctx.fillRect(
        obstacle.x,
        this._model.CANVAS_HEIGHT - obstacle.bottomHeight,
        obstacle.width,
        obstacle.bottomHeight
      );
      this.ctx.strokeRect(
        obstacle.x,
        this._model.CANVAS_HEIGHT - obstacle.bottomHeight,
        obstacle.width,
        obstacle.bottomHeight
      );
    });
  }

  get model(): GameModel {
    return this._model;
  }
}
