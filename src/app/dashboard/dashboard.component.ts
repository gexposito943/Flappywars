import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `<div></div>`,
  styles: []
})
export class DashboardComponent {
  score: number = 0;
  isGameRunning: boolean = false;
  canvasWidth: number = 800;
  canvasHeight: number = 600;
}
