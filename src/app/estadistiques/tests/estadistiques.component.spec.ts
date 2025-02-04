import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstadistiquesComponent } from '../estadistiques.component';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { EstadistiquesController } from '../controllers/estadistiques.controller';

describe('EstadistiquesComponent', () => {
    let component: EstadistiquesComponent;
    let fixture: ComponentFixture<EstadistiquesComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['getGlobalStats']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

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
        fixture.detectChanges();
    });

    it('should create with controller', () => {
        expect(component).toBeTruthy();
        const controller = TestBed.inject(EstadistiquesController);
        expect(controller).toBeTruthy();
    });
}); 