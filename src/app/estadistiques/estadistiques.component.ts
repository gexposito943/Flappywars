import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { EstadistiquesController } from './controllers/estadistiques.controller';
import { EstadistiquesModel } from './models/estadistiques.model';

interface GlobalStats {
  username: string;
  punts_totals: number;
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
}

@Component({
  selector: 'app-estadistiques',
  standalone: true,
  imports: [CommonModule],
  providers: [EstadistiquesController],
  templateUrl: './estadistiques.component.html',
  styleUrls: ['./estadistiques.component.css']
})
export class EstadistiquesComponent implements OnInit {
  globalStats: GlobalStats[] = [];
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private gameService: GameService,
    private router: Router,
    private controller: EstadistiquesController
  ) {}

  get model(): EstadistiquesModel {
    return this.controller.getModel();
  }

  ngOnInit(): void {
    this.controller.loadGlobalStats();
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  loadGlobalStats(): void {
    this.loading = true;
    this.gameService.getGlobalStats().subscribe({
      next: (stats) => {
        this.globalStats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error carregant estadístiques:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }

  returnToDashboard(): void {
    this.controller.returnToDashboard();
  }
}
