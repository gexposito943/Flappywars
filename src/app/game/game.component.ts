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
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private backgroundImage: HTMLImageElement | null = null;
  private playerImage: HTMLImageElement | null = null;
  private imagesLoaded: boolean = false;

  constructor(
    private router: Router,
    private gameService: GameService,
    private registreService: RegistreService,
    private controller: GameController,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('Controller initialized:', controller);
    console.log('Model state:', controller.getModel());

    if (isPlatformBrowser(this.platformId)) {
      this.loadImages();
    }
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCanvas();
      requestAnimationFrame(() => this.drawGame());
    }
  }

  private initializeCanvas() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
  }

  private loadImages(): void {
    this.backgroundImage = new Image();
    this.playerImage = new Image();

    let loadedImages = 0;
    const totalImages = 2;

    const onImageLoad = () => {
        loadedImages++;
        console.log('Imagen cargada:', loadedImages);
        if (loadedImages === totalImages) {
            this.imagesLoaded = true;
            this.startGameLoop();
        }
    };

    const onImageError = (e: Event | string) => {
        console.error('Error cargando imagen:', e);
        if (e instanceof Event) {
            console.log('Ruta de imagen:', (e.target as HTMLImageElement)?.src);
        }
    };

    this.backgroundImage.onload = onImageLoad;
    this.backgroundImage.onerror = onImageError;
    this.playerImage.onload = onImageLoad;
    this.playerImage.onerror = onImageError;

    // Corregir extensión de archivo
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
    this.controller.startGame();
  }

  stopGame(): void {
    this.controller.stopGame();
  }

  togglePause(): void {
    this.controller.togglePause();
  }

  goToDashboard(): void {
    this.controller.goToDashboard();
  }

  get model(): GameModel {
    return this.controller.getModel();
  }

  drawGame(): void {
    if (!isPlatformBrowser(this.platformId) || !this.imagesLoaded) return;
    
    this.ctx.clearRect(0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);

    // Dibujar fondo solo si está cargado
    if (this.backgroundImage) {
      this.ctx.drawImage(
        this.backgroundImage, 
        0, 
        0, 
        this.model.CANVAS_WIDTH, 
        this.model.CANVAS_HEIGHT
      );
    }

    this.drawScore();
    
    // Dibujar jugador solo si está cargado
    if (this.playerImage) {
      this.ctx.drawImage(
        this.playerImage,
        this.model.PLAYER_X,
        this.model.playerY,
        this.model.PLAYER_SIZE,
        this.model.PLAYER_SIZE
      );
    }

    this.drawObstacles();

    requestAnimationFrame(() => this.drawGame());
  }

  private drawScore(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.font = '32px Arial';
    this.ctx.fillText(`Punts: ${this.model.score}`, 20, 50);
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
