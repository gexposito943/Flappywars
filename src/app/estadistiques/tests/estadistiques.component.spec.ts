import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstadistiquesComponent } from '../estadistiques.component';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { EstadistiquesController } from '../controllers/estadistiques.controller';
import { of } from 'rxjs';

describe('EstadistiquesComponent', () => {
    let component: EstadistiquesComponent;
    let fixture: ComponentFixture<EstadistiquesComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let controller: EstadistiquesController;

    const mockGlobalStats = [
        { 
            username: 'Player1', 
            punts_totals: 2500,
            millor_puntuacio: 500,
            total_partides: 10,
            temps_total_jugat: 3600
        }
    ];

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['getGlobalStats']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService.getGlobalStats.and.returnValue(of(mockGlobalStats));

        await TestBed.configureTestingModule({
            imports: [EstadistiquesComponent, HttpClientTestingModule],
            providers: [
                EstadistiquesController,
                { provide: GameService, useValue: mockGameService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EstadistiquesComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(EstadistiquesController);
        fixture.detectChanges();
    });

    it('should create with controller', () => {
        expect(component).toBeTruthy();
        expect(controller).toBeTruthy();
    });

    it('should load global statistics on init', () => {
        expect(mockGameService.getGlobalStats).toHaveBeenCalled();
        expect(controller.getModel().globalStats).toEqual(mockGlobalStats);
    });
}); 