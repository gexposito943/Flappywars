import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardModel } from '../models/dashboard.model';
import { RegistreService } from '../../services/registre.service';

@Injectable()
export class DashboardController {
    private model: DashboardModel;

    constructor(
        private router: Router,
        private registreService: RegistreService
    ) {
        this.model = new DashboardModel();
    }

    getModel(): DashboardModel {
        return this.model;
    }

    selectShip(shipId: number): void {
        this.model.setSelectedShip(shipId);
        this.registreService.setUserData(this.model.userData);
    }

    startGame(): void {
        const selectedShipId = this.model.selectedShipId;
        if (selectedShipId) {
            this.router.navigate(['/game'], {
                state: { 
                    shipId: selectedShipId,
                    userData: this.model.userData
                }
            });
        }
    }
} 