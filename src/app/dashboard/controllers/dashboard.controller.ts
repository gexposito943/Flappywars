import { Injectable } from '@angular/core';
import { DashboardModel } from '../models/dashboard.model';

@Injectable()
export class DashboardController {
    private model: DashboardModel;

    constructor() {
        this.model = new DashboardModel();
    }

    getModel(): DashboardModel {
        return this.model;
    }
} 