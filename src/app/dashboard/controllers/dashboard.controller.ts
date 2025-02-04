import { Injectable } from '@angular/core';
import { DashboardModel } from '../models/dashboard.model';
import { RegistreService } from '../../services/registre.service';

@Injectable()
export class DashboardController {
    private model: DashboardModel;

    constructor(private registreService: RegistreService) {
        this.model = new DashboardModel();
    }

    getModel(): DashboardModel {
        return this.model;
    }

    selectShip(shipId: number): void {
        this.model.setSelectedShip(shipId);
        this.registreService.setUserData(this.model.userData);
    }
} 