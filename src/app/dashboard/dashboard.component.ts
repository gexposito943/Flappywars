import { Component, ElementRef, ViewChild } from '@angular/core';
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
export class DashboardComponent {
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  score: number = 0;
  isGameRunning: boolean = false;
  canvasWidth: number = 800;
  canvasHeight: number = 600;
}
