import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DashboardComponent } from '../dashboard.component';
import { DashboardController, DashboardActionTypes } from '../controllers/dashboard.controller';
import { DashboardModel } from '../models/dashboard.model';
import { RegistreService } from '../../services/registre.service';
import { GameService } from '../../services/game.service';
import { UserStats, UserData } from '../models/interfaces';
import { ShipService } from '../../services/ship.service';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let controller: DashboardController;
    let model: DashboardModel;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockShipService: jasmine.SpyObj<ShipService>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['setUserData', 'getUserData', 'logout']);
        mockGameService = jasmine.createSpyObj('GameService', ['getUserStats']);
        mockShipService = jasmine.createSpyObj('ShipService', ['getShips']);

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                {
                    provide: DashboardController,
                    useFactory: () => new DashboardController(mockRouter, mockRegistreService, mockGameService, mockShipService)
                },
                { provide: Router, useValue: mockRouter },
                { provide: RegistreService, useValue: mockRegistreService },
                { provide: GameService, useValue: mockGameService },
                { provide: ShipService, useValue: mockShipService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(DashboardController);
        model = controller.getModel();
        fixture.detectChanges();
    });

    it('should create component with MVC structure', () => {
        expect(component).toBeTruthy();
        expect(component.model).toBeTruthy();
        expect(controller).toBeTruthy();
        expect(model).toBeInstanceOf(DashboardModel);
    });

    it('should select ship and update user preferences', () => {
        const shipId = 2;
        const mockUserData: UserData = {
            username: 'TestUser',
            nivel: 5,
            puntosTotales: 1000,
            naveActual: 1
        };
        
        model.setData({ userData: mockUserData });
        component.onShipSelect(shipId);
        
        expect(model.selectedShipId).toBe(shipId);
        expect(mockRegistreService.setUserData).toHaveBeenCalledWith({
            ...mockUserData,
            naveActual: shipId
        });
    });

    it('should format statistics display correctly', () => {
        const mockStats: UserStats = {
            millor_puntuacio: 1000,
            total_partides: 50,
            temps_total_jugat: 7200,
            punts_totals: 2500
        };
        
        model.setUserStats(mockStats);
        fixture.detectChanges();

        const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
        expect(statsElements[0].textContent.toUpperCase()).toContain('MILLOR PUNTUACIÓ');
        expect(statsElements[1].textContent.toUpperCase()).toContain('TOTAL PARTIDES');
        expect(statsElements[2].textContent.toUpperCase()).toContain('TEMPS TOTAL JUGAT');
        expect(model.formatTime(7200)).toBe('2h 0m 0s');
    });

    it('should navigate to game when play button is clicked', fakeAsync(() => {
        const shipId = 1;
        model.setSelectedShip(shipId);
        fixture.detectChanges();
        
        component.onStartGame();
        tick();

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/game'], {
            state: { 
                shipId: shipId,
                userData: model.userData
            }
        });
    }));

    describe('User Profile', () => {
        it('should update user level display', async () => {
            // Arrange
            const mockUserData: UserData = {
                username: 'TestUser',
                nivel: 6,
                puntosTotales: 1000,
                naveActual: 1
            };
            model.setData({ userData: mockUserData });
            fixture.detectChanges();
            await fixture.whenStable();
            const levelElement = fixture.debugElement.query(By.css('.stat-badge'));
            expect(levelElement).toBeTruthy();
            expect(levelElement.nativeElement.textContent).toContain('Nivell: 6');
        });
    });

    describe('User Actions', () => {
        it('should handle logout correctly', fakeAsync(() => {
            fixture.detectChanges();
            component.onLogout();
            tick();
            expect(mockRegistreService.logout).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
        }));
    });
});