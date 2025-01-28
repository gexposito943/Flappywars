import { Component, ElementRef, ViewChild, OnInit, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

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
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  score: number = 0;
  isGameRunning: boolean = false;
  isPaused: boolean = false;
  canvasWidth: number = 1440;
  canvasHeight: number = 900;
  private ctx!: CanvasRenderingContext2D;
  private gameLoop: any = null;

  playerY: number = 0;
  playerVelocity: number = 0;
  private readonly GRAVITY: number = 0.3;
  private readonly JUMP_FORCE: number = -8;
  private readonly OBSTACLE_SPEED: number = 3;
  private readonly PLAYER_SIZE: number = 120;
  private readonly PLAYER_X: number = 150;
  private readonly OBSTACLE_GAP: number = 400;
  private readonly OBSTACLE_WIDTH: number = 80;
  private readonly GAP_SIZE: number = 300;
  

  obstacles: Obstacle[] = [];

  gameMessage: string = 'Prem Enter per començar';
  showMessage: boolean = true;

  selectedShipId: number | null = null;
  userData: any = null;

  private playerImage: any;
  private gameResults: any = {
    score: 0,
    time: 0
  };
  private gameStartTime: number = 0;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.selectedShipId = (navigation.extras.state as any).shipId;
      this.userData = (navigation.extras.state as any).userData;
      console.log('Nave recibida en el juego:', this.selectedShipId);
      console.log('Datos de usuario recibidos:', this.userData);
    }

    // Inicializar la imagen solo en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.playerImage = new Image();
      this.playerImage.src = 'assets/images/naus/x-wing.png';
    }
  }

  ngOnInit() {
    if (!this.selectedShipId || !this.userData) {
      console.error('No se recibieron los datos necesarios');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initializeCanvas();
    this.startGame();
  }

  private initializeCanvas() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.isGameRunning) {
      this.startGame();
    }
    if ((event.key === ' ' || event.key === 'ArrowUp') && this.isGameRunning) {
      this.jump();
    }
  }

  startGame() {
    if (this.isGameRunning) return;
    
    console.log('Iniciando juego con nave:', this.selectedShipId);
    this.isGameRunning = true;
    this.showMessage = false;
    this.score = 0;
    this.playerY = this.canvasHeight / 2;
    this.playerVelocity = 0;
    this.obstacles = [this.createObstacle()];
    this.gameStartTime = Date.now();
    this.gameLoop = setInterval(() => this.updateGame(), 1000 / 60);
  }

  saveGameResults() {
    const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
    this.gameResults = {
      score: this.score,
      time: gameTime,
      shipId: this.selectedShipId,
      date: new Date().toISOString()
    };
    
    try {
      // Actualizar estadísticas del usuario
      const userStats = {
        millor_puntuacio: Math.max(this.userData.millor_puntuacio || 0, this.score),
        total_partides: (this.userData.total_partides || 0) + 1,
        temps_total_jugat: (this.userData.temps_total_jugat || 0) + gameTime
      };

      // Actualizar puntos totales
      this.userData.puntosTotales = (this.userData.puntosTotales || 0) + this.score;
      
      // Guardar en localStorage
      localStorage.setItem('userStats', JSON.stringify(userStats));
      localStorage.setItem('userData', JSON.stringify(this.userData));
      
      console.log('Partida guardada exitosamente:', {
        stats: userStats,
        userData: this.userData
      });

      // Mostrar mensaje de éxito
      this.gameMessage = `Partida guardada! Puntuació: ${this.score}`;
      
      // Actualizar el mensaje después de 2 segundos
      setTimeout(() => {
        this.gameMessage = 'Prem Enter per tornar a jugar';
      }, 2000);

    } catch (error) {
      console.error('Error al guardar la partida:', error);
      this.gameMessage = 'Error al guardar la partida';
    }
  }

  stopGame() {
    this.isGameRunning = false;
    this.showMessage = true;
    this.gameMessage = `Game Over - Puntuació: ${this.score}`;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
    this.saveGameResults();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      clearInterval(this.gameLoop);
    } else {
      this.gameLoop = setInterval(() => this.updateGame(), 1000 / 60);
    }
  }

  applyGravity() {
    this.playerVelocity += this.GRAVITY;
    this.playerY += this.playerVelocity;
  }

  jump() {
    if (!this.isGameRunning) return;
    this.playerVelocity = this.JUMP_FORCE;
    this.playerY += this.playerVelocity;
  }

  moveObstacles() {
    this.obstacles = this.obstacles.map(obstacle => ({
      ...obstacle,
      x: obstacle.x - this.OBSTACLE_SPEED
    }));
  }

  checkCollision(): boolean {
    return this.obstacles.some(obstacle => {
      const inXRange = this.PLAYER_X < obstacle.x + 50 && 
                      this.PLAYER_X + (this.PLAYER_SIZE * 0.8) > obstacle.x;
      
      const hitTop = this.playerY + (this.PLAYER_SIZE * 0.2) < obstacle.topHeight;
      const hitBottom = this.playerY + (this.PLAYER_SIZE * 0.8) > this.canvasHeight - obstacle.bottomHeight;
      
      return inXRange && (hitTop || hitBottom);
    });
  }

  updateScore() {
    const passedObstacle = this.obstacles.find(obstacle => 
      obstacle.x + 50 < this.PLAYER_X && !obstacle.passed
    );
    if (passedObstacle) {
      this.score++;
      passedObstacle.passed = true;
    }
  }

  handleCollision() {
    this.stopGame();
  }

  private createObstacle(): Obstacle {
    const topHeight = Math.random() * (this.canvasHeight - this.GAP_SIZE - 100);
    return {
      x: this.canvasWidth,
      topHeight: topHeight,
      bottomHeight: this.canvasHeight - topHeight - this.GAP_SIZE,
      passed: false
    };
  }

  private updateGame() {
    if (this.isPaused) return;
    
    this.applyGravity();
    this.moveObstacles();
    this.updateScore();
    
    if (this.checkCollision()) {
      this.handleCollision();
      return;
    }
    
    if (this.obstacles.length === 0 || 
        this.obstacles[this.obstacles.length - 1].x < this.canvasWidth - this.OBSTACLE_GAP) {
      this.obstacles.push(this.createObstacle());
    }
    
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x > -this.OBSTACLE_WIDTH);
    
    this.drawGame();
  }

  private drawGame() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.ctx.fillStyle = 'white';
    this.ctx.font = '32px Arial';
    this.ctx.fillText(`Punts: ${this.score}`, 20, 50);

    if (this.playerImage && this.playerImage.complete) {
      this.ctx.save();
      
      const rotation = this.playerVelocity * 0.05;
      
      this.ctx.translate(
        this.PLAYER_X + this.PLAYER_SIZE/2,
        this.playerY + this.PLAYER_SIZE/2
      );
      
      this.ctx.rotate(rotation);
      
      this.ctx.drawImage(
        this.playerImage,
        -this.PLAYER_SIZE/2,
        -this.PLAYER_SIZE/2,
        this.PLAYER_SIZE,
        this.PLAYER_SIZE
      );
      
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(this.PLAYER_X, this.playerY, this.PLAYER_SIZE, this.PLAYER_SIZE);
    }

    this.ctx.fillStyle = '#2ecc71';
    this.obstacles.forEach(obstacle => {
      this.ctx.fillRect(obstacle.x, 0, this.OBSTACLE_WIDTH, obstacle.topHeight);
      this.ctx.fillRect(
        obstacle.x, 
        this.canvasHeight - obstacle.bottomHeight, 
        this.OBSTACLE_WIDTH, 
        obstacle.bottomHeight
      );

      this.ctx.strokeStyle = '#27ae60';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(obstacle.x, 0, this.OBSTACLE_WIDTH, obstacle.topHeight);
      this.ctx.strokeRect(
        obstacle.x, 
        this.canvasHeight - obstacle.bottomHeight, 
        this.OBSTACLE_WIDTH, 
        obstacle.bottomHeight
      );
    });
  }

  get isGameLoopRunning(): boolean {
    return this.gameLoop !== null;
  }

  goToDashboard() {
    this.stopGame(); 
    this.router.navigate(['/dashboard']);
  }
}
