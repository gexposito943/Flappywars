/**
 * Component principal del joc
 * Gestiona la interfície d'usuari i delega la lògica al controlador
 */
import { Component, ElementRef, ViewChild, OnInit, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { GameService, GameResult } from '../services/game.service';
import { RegistreService } from '../services/registre.service';
import { GameController } from './controllers/game.controller';
import { GameModel } from './models/game.model';

interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  providers: [GameController],
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

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    private controller: GameController,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.backgroundImage = new Image();
    this.playerImage = new Image();
    
    if (isPlatformBrowser(this.platformId)) {
      this.loadImages();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCanvas();
      this.startGameLoop();
    }
  }

  private initializeCanvas() {
    if (!this.canvas) {
      console.error('Canvas element not found');
      return;
    }
    
    const context = this.canvas.nativeElement.getContext('2d');
    if (!context) {
      console.error('Could not get 2D context');
      return;
    }
    
    this.ctx = context;
  }

  private loadImages(): void {
    let loadedImages = 0;
    const totalImages = 2;

    const onImageLoad = () => {
      loadedImages++;
      console.log('Imagen cargada:', loadedImages);
      if (loadedImages === totalImages) {
        this.imagesLoaded = true;
        console.log('Todas las imágenes cargadas');
      }
    };

    this.backgroundImage.onload = onImageLoad;
    this.playerImage.onload = onImageLoad;

    this.backgroundImage.src = 'assets/images/starwars1.jpeg';
    this.playerImage.src = 'assets/images/naus/x-wing.png';
  }

  private startGameLoop() {
    if (isPlatformBrowser(this.platformId)) {
      requestAnimationFrame(() => this.drawGame());
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.model.isGameRunning) {
      this.startGame();
    }
    if (event.key === 'ArrowUp' && this.model.isGameRunning) {
      this.controller.jump();
    }
    if (event.key === ' ') {
      event.preventDefault();
      if (this.model.isGameRunning) {
        this.togglePause();
      }
    }
  }

  startGame(): void {
    console.log('Iniciando juego...');
    this.controller.startGame();
    
    // Iniciar el bucle del juego si no está corriendo
    if (!this.gameLoop) {
      this.gameLoop = setInterval(() => {
        if (this.model.isGameRunning && !this.model.isPaused) {
          this.controller.updateGame();
          this.drawGame();
        }
      }, 1000 / 60);
    }
  }

  stopGame(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.controller.stopGame();
  }

  togglePause(): void {
    this.controller.togglePause();
    if (this.model.isPaused && this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    } else if (!this.model.isPaused && !this.gameLoop) {
      this.startGame();
    }
  }

  goToDashboard(): void {
    this.controller.goToDashboard();
  }

  get model(): GameModel {
    return this.controller.getModel();
  }

  drawGame(): void {
    if (!this.ctx || !this.imagesLoaded) {
      console.log('No se puede dibujar: contexto o imágenes no disponibles');
      return;
    }

    // Limpiar el canvas
    this.ctx.clearRect(0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);

    // Dibujar fondo
    if (this.backgroundImage.complete) {
      this.ctx.drawImage(this.backgroundImage, 0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);
    }

    // Dibujar obstáculos solo si el juego está corriendo
    if (this.model.isGameRunning) {
      this.drawObstacles();
    }

    // Dibujar jugador solo si el juego está corriendo
    if (this.model.isGameRunning && this.playerImage.complete) {
      this.ctx.drawImage(
        this.playerImage,
        this.model.PLAYER_X,
        this.model.playerY,
        this.model.PLAYER_SIZE,
        this.model.PLAYER_SIZE
      );
    }
  }

  private drawObstacles(): void {
    this.ctx.fillStyle = '#2ecc71';
    this.model.obstacles.forEach(obstacle => {
      this.ctx.fillRect(
        obstacle.x, 
        0, 
        this.model.OBSTACLE_WIDTH, 
        obstacle.topHeight
      );
      
      this.ctx.fillRect(
        obstacle.x, 
        this.model.CANVAS_HEIGHT - obstacle.bottomHeight, 
        this.model.OBSTACLE_WIDTH, 
        obstacle.bottomHeight
      );

      this.ctx.strokeStyle = '#27ae60';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(
        obstacle.x, 
        0, 
        this.model.OBSTACLE_WIDTH, 
        obstacle.topHeight
      );
      this.ctx.strokeRect(
        obstacle.x, 
        this.model.CANVAS_HEIGHT - obstacle.bottomHeight, 
        this.model.OBSTACLE_WIDTH, 
        obstacle.bottomHeight
      );
    });
  }

  saveGame(): void {
    this.controller.saveGameResults();
  }
}
