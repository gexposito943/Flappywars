import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from '../dashboard.component';
import { DashboardController } from '../controllers/dashboard.controller';
import { RegistreService } from '../../services/registre.service';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let controller: DashboardController;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [DashboardController, { provide: RegistreService, useValue: jasmine.createSpyObj('RegistreService', ['setUserData'])}]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(DashboardController);
        mockRegistreService = TestBed.inject(RegistreService) as jasmine.SpyObj<RegistreService>;
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
}); 