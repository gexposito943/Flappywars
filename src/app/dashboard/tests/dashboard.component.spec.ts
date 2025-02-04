import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from '../dashboard.component';
import { DashboardController } from '../controllers/dashboard.controller';
import { DashboardModel } from '../models/dashboard.model';
import { RegistreService } from '../../services/registre.service';
import { GameService } from '../../services/game.service';
import { UserStats, UserData } from '../models/interfaces';
import { ShipService } from '../../services/ship.service';
import { of } from 'rxjs';
import { DashboardActionTypes } from '../models/dashboard.actions';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let controller: DashboardController;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockShipService: jasmine.SpyObj<ShipService>;

    const mockUserData = {
        username: 'TestUser',
        nivel: 6,
        puntosTotales: 1000,
        naveActual: 1
    };

    const mockShips = [
        {
            id: 1,
            nom: 'Nau de Combat',
            velocitat: 100,
            imatge_url: 'x-wing.png',
            descripcio: 'Nau de combat versàtil',
            required_points: 0
        },
        {
            id: 2,
            nom: 'Nau Avançada',
            velocitat: 120,
            imatge_url: 'tie-fighter.png',
            descripcio: 'Nau avançada',
            required_points: 1000
        }
    ];

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockRegistreService = jasmine.createSpyObj('RegistreService', [
            'getUserData', 
            'setUserData', 
            'logout'
        ]);
        mockGameService = jasmine.createSpyObj('GameService', [
            'getUserStats', 
            'hasSavedGame', 
            'getUserAchievements'
        ]);
        mockShipService = jasmine.createSpyObj('ShipService', ['getShips']);

        // Configurar los mocks
        mockRegistreService.getUserData.and.returnValue(mockUserData);
        mockGameService.getUserStats.and.returnValue(of({
            millor_puntuacio: 100,
            total_partides: 5,
            temps_total_jugat: 300,
            punts_totals: 1000
        }));
        mockGameService.hasSavedGame.and.returnValue(false);
        mockGameService.getUserAchievements.and.returnValue(of([]));
        mockShipService.getShips.and.returnValue(of(mockShips));

        await TestBed.configureTestingModule({
            imports: [DashboardComponent, HttpClientTestingModule],
            providers: [
                DashboardController,
                { provide: Router, useValue: mockRouter },
                { provide: RegistreService, useValue: mockRegistreService },
                { provide: GameService, useValue: mockGameService },
                { provide: ShipService, useValue: mockShipService }
            ]
        }).overrideTemplate(DashboardComponent, `
            <div class="user-level">Nivell: {{userData.nivel}}</div>
            <button class="play-button" (click)="onStartGame()">Jugar</button>
            <button class="ship-select" (click)="onShipSelect(2)">Select Ship</button>
        `).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(DashboardController);
        
        spyOn(controller, 'dispatch').and.callThrough();
        
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with user data and ships', fakeAsync(() => {
        tick();
        expect(mockShipService.getShips).toHaveBeenCalled();
        expect(mockRegistreService.getUserData).toHaveBeenCalled();
        expect(mockGameService.getUserStats).toHaveBeenCalled();
        expect(component.availableShips.length).toBe(2);
    }));

    it('should select ship and update user preferences', fakeAsync(() => {
        const button = fixture.debugElement.query(By.css('.ship-select'));
        button.nativeElement.click();
        tick();

        expect(controller.dispatch).toHaveBeenCalledWith({
            type: DashboardActionTypes.SELECT_SHIP,
            payload: 2
        });
    }));

    it('should navigate to game when play button is clicked', fakeAsync(() => {
        const button = fixture.debugElement.query(By.css('.play-button'));
        button.nativeElement.click();
        tick();

        expect(controller.dispatch).toHaveBeenCalledWith({
            type: DashboardActionTypes.START_GAME
        });
    }));

    describe('User Profile', () => {
        it('should display correct user level', () => {
            expect(component.getUserLevel()).toBe(6);
        });

        it('should format time correctly', () => {
            expect(component.formatTime(3600)).toContain('1:00:00');
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});