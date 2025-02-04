import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from '../dashboard.component';
import { DashboardController } from '../controllers/dashboard.controller';
import { RegistreService } from '../../services/registre.service';
import { Router } from '@angular/router';
import { fakeAsync, tick } from '@angular/core/testing';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let controller: DashboardController;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [DashboardController, { provide: RegistreService, useValue: jasmine.createSpyObj('RegistreService', ['setUserData'])}, { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate'])}]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(DashboardController);
        mockRegistreService = TestBed.inject(RegistreService) as jasmine.SpyObj<RegistreService>;
        mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        fixture.detectChanges();
    });

    it('should create component with MVC structure', () => {
        expect(component).toBeTruthy();
        expect(component.model).toBeTruthy();
        expect(controller).toBeTruthy();
    });

    it('should select ship and update user preferences', () => {
        // Arrange
        const shipId = 2;
        const mockUserData = {
            username: 'TestUser',
            nivel: 5,
            puntosTotales: 1000,
            naveActual: 1
        };
        
        component.model.setUserData(mockUserData);
        
        // Act
        component.controller.selectShip(shipId);
        
        // Assert
        expect(component.model.selectedShipId).toBe(shipId);
        expect(mockRegistreService.setUserData).toHaveBeenCalledWith({
            ...mockUserData,
            naveActual: shipId
        });
    });

    it('should format statistics display correctly', () => {
        // Arrange
        const mockStats = {
            millor_puntuacio: 1000,
            total_partides: 50,
            temps_total_jugat: 7200,
            punts_totals: 2500
        };
        
        // Act
        component.model.loadUserStats(mockStats);
        fixture.detectChanges();

        // Assert
        const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
        expect(statsElements[0].textContent.toUpperCase()).toContain('MILLOR PUNTUACIÓ');
        expect(statsElements[1].textContent.toUpperCase()).toContain('TOTAL PARTIDES');
        expect(statsElements[2].textContent.toUpperCase()).toContain('TEMPS TOTAL JUGAT');
        expect(component.model.formatTime(7200)).toBe('2h 0m 0s');
    });

    it('should navigate to game when play button is clicked', fakeAsync(() => {
        // Arrange
        const shipId = 1;
        component.model.setSelectedShip(shipId);
        fixture.detectChanges();

        // Act
        component.controller.startGame();
        tick();

        // Assert
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/game'], {
            state: { 
                shipId: shipId,
                userData: component.model.userData
            }
        });
    }));
}); 