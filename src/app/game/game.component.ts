import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #gameCanvas 
            [width]="canvasWidth" 
            [height]="canvasHeight">
    </canvas>
    <div class="game-controls">
      <button (click)="startGame()">Iniciar</button>
      <button (click)="togglePause()">{{ isPaused ? 'Continuar' : 'Pausar' }}</button>
      <button (click)="stopGame()">Aturar</button>
    </div>
  `,
  styles: [`
    canvas {
      border: 1px solid #000;
    }
    .game-controls {
      margin-top: 10px;
    }
  `]
})
export class GameComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  score: number = 0;
  isGameRunning: boolean = false;
  isPaused: boolean = false;
  canvasWidth: number = 800;
  canvasHeight: number = 600;
  private ctx!: CanvasRenderingContext2D;
  private gameLoop: any = null;

  playerY: number = 0;
  playerVelocity: number = 0;
  private readonly GRAVITY: number = 0.5;
  private readonly JUMP_FORCE: number = -10;
  private readonly OBSTACLE_SPEED = 2;
  private readonly PLAYER_SIZE = 30;
  private readonly PLAYER_X = 50;
  

  obstacles: Obstacle[] = [];

  ngOnInit() {
    this.initializeCanvas();
  }

  private initializeCanvas() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
  }

  startGame() {
    if (this.isGameRunning) return;
    
    this.isGameRunning = true;
    this.score = 0;
    this.playerY = this.canvasHeight / 2;
    this.playerVelocity = 0;
    this.gameLoop = setInterval(() => this.updateGame(), 1000 / 60);
  }

  stopGame() {
    this.isGameRunning = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
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
    this.playerVelocity = this.JUMP_FORCE;
  }

  moveObstacles() {
    this.obstacles = this.obstacles.map(obstacle => ({
      ...obstacle,
      x: obstacle.x - this.OBSTACLE_SPEED
    }));
  }

  checkCollision(): boolean {
    return this.obstacles.some(obstacle => {
      const inXRange = this.PLAYER_X < obstacle.x + 50 && this.PLAYER_X + this.PLAYER_SIZE > obstacle.x;
      const hitTop = this.playerY < obstacle.topHeight;
      const hitBottom = this.playerY + this.PLAYER_SIZE > this.canvasHeight - obstacle.bottomHeight;
      return inXRange && (hitTop || hitBottom);
    });
  }

  private updateGame() {
    if (this.isPaused) return;
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    this.applyGravity();
    this.moveObstacles();
    
    if (this.checkCollision()) {
      this.stopGame();
    }
    
    this.drawGame();
  }

  private drawGame() {
    // Dibujar el jugador
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(50, this.playerY, 30, 30);

    // Dibujar obstáculos
    this.ctx.fillStyle = 'green';
    this.obstacles.forEach(obstacle => {
      this.ctx.fillRect(obstacle.x, 0, 20, obstacle.topHeight);
      this.ctx.fillRect(obstacle.x, this.canvasHeight - obstacle.bottomHeight, 20, obstacle.bottomHeight);
    });
  }
}
