import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  canvasWidth: number = 800;
  canvasHeight: number = 600;
  private ctx!: CanvasRenderingContext2D;
  private gameLoop: any = null;

  playerY: number = 0;
  playerVelocity: number = 0;
  private readonly GRAVITY: number = 0.5;
  private readonly JUMP_FORCE: number = -10;
  private readonly OBSTACLE_SPEED: number = 2;
  private readonly PLAYER_SIZE: number = 30;
  private readonly PLAYER_X: number = 50;
  private readonly GAP_SIZE: number = 150;
  

  obstacles: Obstacle[] = [];

  constructor(private router: Router) {}

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
    this.obstacles = [this.createObstacle()];
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
      const inXRange = this.PLAYER_X < obstacle.x + 50 && this.PLAYER_X + this.PLAYER_SIZE > obstacle.x;
      const hitTop = this.playerY < obstacle.topHeight;
      const hitBottom = this.playerY + this.PLAYER_SIZE > this.canvasHeight - obstacle.bottomHeight;
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
    const topHeight = Math.random() * (this.canvasHeight - this.GAP_SIZE);
    return {
      x: this.canvasWidth,
      topHeight: topHeight,
      bottomHeight: this.canvasHeight - topHeight - this.GAP_SIZE,
      passed: false
    };
  }

  private updateGame() {
    if (this.isPaused) return;
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    this.applyGravity();
    this.moveObstacles();
    this.updateScore();
    
    if (this.checkCollision()) {
      this.handleCollision();
      return;
    }
    
    if (this.obstacles[this.obstacles.length - 1].x < this.canvasWidth - 300) {
      this.obstacles.push(this.createObstacle());
    }
    
    this.obstacles = this.obstacles.filter(obstacle => obstacle.x > -50);
    
    this.drawGame();
  }

  private drawGame() {
    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(this.PLAYER_X, this.playerY, this.PLAYER_SIZE, this.PLAYER_SIZE);

    this.ctx.fillStyle = 'green';
    this.obstacles.forEach(obstacle => {
      this.ctx.fillRect(obstacle.x, 0, 50, obstacle.topHeight);
      this.ctx.fillRect(
        obstacle.x, 
        this.canvasHeight - obstacle.bottomHeight, 
        50, 
        obstacle.bottomHeight
      );
    });
  }

  get isGameLoopRunning(): boolean {
    return this.gameLoop !== null;
  }

  goToDashboard() {
    this.stopGame();  // Aseguramos que el juego se detiene
    this.router.navigate(['/dashboard']);
  }
}
