import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameComponent } from '../game.component';
import { GameService } from '../../../services/game.service';
import { RegistreService } from '../../../services/registre.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService = jasmine.createSpyObj('GameService', ['saveGameResults', 'getUserShip']);
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['getToken', 'getUserId']);

        mockGameService.saveGameResults.and.returnValue(of({ success: true }));
        mockGameService.getUserShip.and.returnValue(of({ 
            success: true, 
            nau: {
                id: '1',
                nom: 'test-ship',
                velocitat: 100,
                imatge_url: 'test-url',
                descripcio: 'test-description'
            }
        }));
        mockRegistreService.getToken.and.returnValue('test-token');
        mockRegistreService.getUserId.and.returnValue('test-id');

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

        // Mock del canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1440;
        canvas.height = 900;
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
            expect(component['model'].score).toBe(0);
            expect(component['model'].isGameRunning).toBeFalse();
            expect(component['model'].isPaused).toBeFalse();
            expect(component['model'].obstacles.length).toBe(0);
        });

        it('should have correct initial player position', () => {
            expect(component['model'].position.x).toBe(100);
            expect(component['model'].position.y).toBe(450);
            expect(component['model'].velocity).toBe(0);
        });
    });

    describe('Game Controls', () => {
        it('should handle keyboard events', () => {
            component.startGame();
            
            component.handleKeyboardEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));
            expect(component['model'].velocity).toBeLessThan(0);

            component.handleKeyboardEvent(new KeyboardEvent('keydown', { code: 'Space' }));
            expect(component['model'].isPaused).toBeTrue();
        });

        it('should toggle pause correctly', () => {
            component['model'].isGameRunning = true;
            
            component.togglePause();
            expect(component['model'].isPaused).toBeTrue();
            expect(component['model'].gameMessage).toBe('Joc en Pausa');
            
            component.togglePause();
            expect(component['model'].isPaused).toBeFalse();
        });
    });

    describe('Game Logic', () => {
        it('should handle game over', fakeAsync(() => {
            component.startGame();
            component['onGameOver']();
            tick();
            
            expect(component['model'].isGameRunning).toBeFalse();
            expect(component['model'].showMessage).toBeTrue();
            expect(mockGameService.saveGameResults).toHaveBeenCalled();
        }));

        it('should save game results', fakeAsync(() => {
            component.startGame();
            component.saveGameResults();
            tick();
            
            expect(mockGameService.saveGameResults).toHaveBeenCalled();
            expect(component['model'].gameMessage).toContain('Partida guardada');
        }));

        it('should navigate to dashboard', () => {
            component.goToDashboard();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });
}); 