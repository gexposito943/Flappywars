import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { EstadistiquesModel } from './models/estadistiques.model';
import { GlobalStats } from '../../interfaces/base-stats.interface';
import { ApiResponse } from '../../interfaces/api-response.interface';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-estadistiques',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: 'estadistiques.component.html',
    styleUrls: ['estadistiques.component.css']
})
export class EstadistiquesComponent implements OnInit {
    model = new EstadistiquesModel();
    searchTerm: string = '';
    filteredEstadistiques: GlobalStats[] = [];
    isAdmin = false;

    constructor(
        private gameService: GameService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.isAdmin = typeof this.gameService.isAdmin === 'function' 
            ? this.gameService.isAdmin() 
            : false;
        console.log('Es admin:', this.isAdmin);
        this.loadEstadistiques();
    }

    filterEstadistiques(): void {
        if (!this.searchTerm.trim()) {
            this.filteredEstadistiques = this.model.estadistiques;
        } else {
            this.filteredEstadistiques = this.model.estadistiques.filter(stat =>
                stat.username.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }
        this.model.currentPage = 1; // Reset a la primera página al filtrar
    }

    get paginatedEstadistiques(): GlobalStats[] {
        const startIndex = (this.model.currentPage - 1) * this.model.itemsPerPage;
        const endIndex = startIndex + this.model.itemsPerPage;
        return this.filteredEstadistiques.slice(startIndex, endIndex);
    }

    get totalPages(): number {
        return Math.ceil(this.filteredEstadistiques.length / this.model.itemsPerPage);
    }

    onPageChange(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.model.currentPage = page;
        }
    }

    getPageNumbers(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    onDeleteUser(userId: string, username: string): void {
        if (!this.isAdmin) return;
        
        if (username === 'admin') {
            alert('No es pot eliminar l\'usuari administrador');
            return;
        }

        if (confirm(`Estàs segur que vols eliminar l'usuari ${username}? Aquesta acció no es pot desfer.`)) {
            this.gameService.deleteUser(userId).subscribe({
                next: (response) => {
                    if (response.success) {
                        alert('Usuari eliminat correctament');
                        this.loadEstadistiques(); // Recargar la lista
                    } else {
                        alert('Error al eliminar l\'usuari: ' + response.message);
                    }
                },
                error: (error) => {
                    console.error('Error:', error);
                    alert('Error al eliminar l\'usuari: ' + (error.error?.message || 'Error desconegut'));
                }
            });
        }
    }

    private loadEstadistiques(): void {
        this.model.loading = true;
        this.model.error = false;
        
        this.gameService.getGlobalStats().subscribe({
            next: (response: ApiResponse<GlobalStats[]>) => {
                if (response.success && response.ranking) {
                    this.model.setEstadistiquesFromGlobalStats(response.ranking);
                    this.filteredEstadistiques = this.model.estadistiques;
                }
            },
            error: (error) => {
                console.error('Error carregant estadístiques:', error);
                this.model.error = true;
            },
            complete: () => {
                this.model.loading = false;
            }
        });
    }

    formatTime(seconds: number): string {
        return this.model.formatTime(seconds);
    }

    returnToDashboard(): void {
        this.router.navigate(['/dashboard']);
    }
}
