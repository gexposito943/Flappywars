import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../services/game.service';

interface GlobalStats {
  username: string;
  punts_totals: number;
}

@Component({
  selector: 'app-estadistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadistiques.component.html',
  styleUrls: ['./estadistiques.component.css']
})
export class EstadistiquesComponent implements OnInit {
  globalStats: GlobalStats[] = [];
  loading: boolean = true;
  error: boolean = false;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.loadGlobalStats();
  }

  loadGlobalStats(): void {
    this.loading = true;
    this.gameService.getGlobalStats().subscribe({
      next: (stats) => {
        this.globalStats = stats.sort((a, b) => b.punts_totals - a.punts_totals);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error el carregar estadístiques', error);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
