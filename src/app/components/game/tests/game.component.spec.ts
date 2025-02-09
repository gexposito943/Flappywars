import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameComponent } from '../game.component';
import { GameService } from '../../../services/game.service';
import { RegistreService } from '../../../services/registre.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { GameModel } from '../models/game.model';
import { Usuari } from '../../../models/usuari.model';
import { Obstacle } from '../../../models/obstacle.model';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService = jasmine.createSpyObj('GameService', ['saveGameResults']);
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['getToken', 'getUserData']);

        mockGameService.saveGameResults.and.returnValue(of({}));
        mockRegistreService.getToken.and.returnValue('test-token');
        mockRegistreService.getUserData.and.returnValue({
            id: '123e4567-e89b-12d3-a456-426614174000',
            nom_usuari: 'testUser',
            email: 'test@test.com',
            nivell: 5,
            punts_totals: 1000,
            nau_actual: null,
            data_registre: '2024-01-01T00:00:00Z',
            ultim_acces: null,
            estat: 'actiu' as const,
            intents_login: 0
        });

        await TestBed.configureTestingModule({
            imports: [GameComponent, HttpClientTestingModule],
            providers: [
                { provide: Router, useValue: mockRouter },
                { provide: GameService, useValue: mockGameService },
                { provide: RegistreService, useValue: mockRegistreService }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;

        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        Object.defineProperty(component, 'canvas', {
            writable: true,
            value: { nativeElement: canvas }
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Game Model', () => {
        it('should initialize with default values', () => {
            const model = (component as any).model as GameModel;
            expect(model.score).toBe(0);
            expect(model.isGameRunning).toBeFalse();
            expect(model.isPaused).toBeFalse();
            expect(model.obstacles.length).toBe(0);
        });

        it('should create player with correct initial values', () => {
            const model = (component as any).model as GameModel;
            expect(model.position.x).toBe(100);
            expect(model.position.y).toBe(450);
            expect(model.velocity).toBe(0);
        });

        it('should create obstacles correctly', () => {
            const model = (component as any).model as GameModel;
            const obstacle = model.createObstacle();
            expect(obstacle).toBeInstanceOf(Obstacle);
            expect(obstacle.x).toBe(model.CANVAS_WIDTH);
            expect(obstacle.passed).toBeFalse();
        });
    });

    describe('Game Controls', () => {
        it('should handle keyboard events', () => {
            const model = (component as any).model as GameModel;
            
            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            expect(model.isGameRunning).toBeTrue();

            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            expect(model.velocity).toBeLessThan(0);


            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(model.isPaused).toBeTrue();
        });

        it('should toggle pause correctly', () => {
            const model = (component as any).model as GameModel;
            model.isGameRunning = true;
            
            component.togglePause();
            expect(model.isPaused).toBeTrue();
            
            component.togglePause();
            expect(model.isPaused).toBeFalse();
        });

        it('should navigate to dashboard', () => {
            component.goToDashboard();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });

    describe('Game Logic', () => {
        it('should update score when passing obstacles', fakeAsync(() => {
            const model = (component as any).model as GameModel;
            component.startGame();
            
            model.obstacles = [{
                x: 90,  // Just passed the player
                topHeight: 100,
                bottomHeight: 100,
                passed: false,
                width: 60
            } as Obstacle];

            (component as any).updateScore();
            expect(model.score).toBe(1);
        }));

        it('should detect collisions correctly', () => {
            const model = (component as any).model as GameModel;
            model.position = { x: model.position.x, y: 0 };  // Usar position en lugar de usuari.posicioY
            


            model.obstacles = [{
                x: 100,
                topHeight: 200,
                bottomHeight: 200,
                passed: false,
                width: 60
            } as Obstacle];

            expect(model.checkCollision()).toBeTrue();
        });

        it('should save game results', fakeAsync(() => {
            component.startGame();
            component.saveGameResults();
            tick();
            
            expect(mockGameService.saveGameResults).toHaveBeenCalled();
            const model = (component as any).model as GameModel;
            expect(model.gameMessage).toContain('Partida guardada');
        }));
    });
}); 