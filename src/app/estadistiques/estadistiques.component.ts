import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadistiquesController } from './controllers/estadistiques.controller';
import { EstadistiquesModel } from './models/estadistiques.model';


 //Actua com a vista en el patró MVC, delegant tota la lògica al controlador
 
@Component({
    selector: 'app-estadistiques',
    standalone: true,
    imports: [CommonModule],
    providers: [EstadistiquesController],
    templateUrl: './estadistiques.component.html',
    styleUrls: ['./estadistiques.component.css']
})
export class EstadistiquesComponent implements OnInit {
    constructor(private controller: EstadistiquesController) {}

    // Accedeix al model a través del controlador
    get model(): EstadistiquesModel {
        return this.controller.getModel();
    }

    // Inicialitza les dades quan es carrega el component
    ngOnInit(): void {
        this.controller.loadGlobalStats();
    }

    formatTime(seconds: number): string {
        return this.controller.formatTime(seconds);
    }

    // Delega la navegació al controlador
    returnToDashboard(): void {
        this.controller.returnToDashboard();
    }
}
