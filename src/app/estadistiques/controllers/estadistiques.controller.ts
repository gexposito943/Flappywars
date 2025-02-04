import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { EstadistiquesModel } from '../models/estadistiques.model';

@Injectable()
export class EstadistiquesController {
    private model: EstadistiquesModel;

    constructor(
        private gameService: GameService,
        private router: Router
    ) {
        this.model = new EstadistiquesModel();
    }

    getModel(): EstadistiquesModel {
        return this.model;
    }
} 