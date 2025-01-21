import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <canvas #gameCanvas 
            [width]="canvasWidth" 
            [height]="canvasHeight">
    </canvas>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  score: number = 0;
  isGameRunning: boolean = false;
  canvasWidth: number = 800;
  canvasHeight: number = 600;
  private ctx!: CanvasRenderingContext2D;

  ngOnInit() {
    this.initializeCanvas();
  }

  private initializeCanvas() {
    this.ctx = this.gameCanvas.nativeElement.getContext('2d')!;
  }
}
