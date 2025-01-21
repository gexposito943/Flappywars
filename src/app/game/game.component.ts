import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  private updateGame() {
    if (this.isPaused) return;
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // Aquí irá la lógica del juego
  }
}
