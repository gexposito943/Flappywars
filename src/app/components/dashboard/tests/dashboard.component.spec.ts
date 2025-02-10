import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from '../dashboard.component';
import { RegistreService } from '../../../services/registre.service';
import { GameService } from '../../../services/game.service';
import { ShipService } from '../../../services/ship.service';
import { of } from 'rxjs';
import { Nau } from '../../../models/nau.model';


describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockShipService: jasmine.SpyObj<ShipService>;

    const mockUserData = {
        id: '1',
        nom_usuari: 'TestUser',
        email: 'test@test.com',
        nivell: 6,
        punts_totals: 1000,
        data_registre: new Date().toISOString(),
        ultim_acces: new Date().toISOString(),
        estat: 'actiu',
        intents_login: 0,
        nau_actual: 1
    };

    const mockShips = [
        {
            id: 1,
            nom: 'Nau de Combat',
            velocitat: 100,
            imatge_url: 'x-wing.png',
            descripcio: 'Nau de combat versàtil'
        },
        {
            id: 2,
            nom: 'Nau Avançada',
            velocitat: 120,
            imatge_url: 'tie-fighter.png',
            descripcio: 'Nau avançada'
        }
    ];

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['getUserData', 'logout']);
        mockGameService = jasmine.createSpyObj('GameService', ['getUserStats']);
        mockShipService = jasmine.createSpyObj('ShipService', ['getShips']);

        mockRegistreService.getUserData.and.returnValue(mockUserData as any);
        mockGameService.getUserStats.and.returnValue(of({
            millor_puntuacio: 100,
            total_partides: 5,
            temps_total_jugat: 300,
            punts_totals: 1000
        } as any));
        mockShipService.getShips.and.returnValue(of(mockShips as any));

        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, DashboardComponent],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: RegistreService, useValue: mockRegistreService },
                { provide: GameService, useValue: mockGameService },
                { provide: ShipService, useValue: mockShipService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with user data and ships', fakeAsync(() => {
        tick();
        expect(mockShipService.getShips).toHaveBeenCalled();
        expect(mockRegistreService.getUserData).toHaveBeenCalled();
        expect(mockGameService.getUserStats).toHaveBeenCalled();
        expect(component.model.naus.length).toBe(2);
    }));


    it('should select ship when available', () => {
        const nau = new Nau();
        Object.assign(nau, mockShips[0]);
        component.onShipSelect(nau);
        expect(component.model.nauSeleccionada).toBe(nau);
    });


    it('should navigate to game when play button is clicked', () => {
        const nau = new Nau();
        Object.assign(nau, mockShips[0]);
        component.model.nauSeleccionada = nau;
        

        component.onStartGame();
        
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/game'], {
            state: {
                nau: component.model.nauSeleccionada,
                usuari: component.model.usuari
            }

        });
    });

    it('should format time correctly', () => {
        const formattedTime = component.formatTime(3600);
        expect(formattedTime).toBe('1:00:00');
    });

    it('should logout and navigate to home', () => {
        component.onLogout();
        expect(mockRegistreService.logout).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    afterEach(() => {
        fixture.destroy();
    });
});