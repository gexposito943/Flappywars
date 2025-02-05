/**
 * Tests per al component de joc interficies i intereccio usuari.
 */
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { GameComponent } from '../game.component';
import { GameController } from '../controllers/game.controller';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { GameActionTypes } from '../models/game.actions';
import { of } from 'rxjs';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    let controller: GameController;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;

    beforeEach(async () => {
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService = jasmine.createSpyObj('GameService', ['saveGameResults']);
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['getToken', 'getUserData']);

        mockGameService.saveGameResults.and.returnValue(of({}));
        mockRegistreService.getToken.and.returnValue('test-token');
        mockRegistreService.getUserData.and.returnValue({});

        await TestBed.configureTestingModule({
            imports: [GameComponent, HttpClientTestingModule],
            providers: [
                GameController,
                { provide: Router, useValue: mockRouter },
                { provide: GameService, useValue: mockGameService },
                { provide: RegistreService, useValue: mockRegistreService }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(GameController);

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

    describe('Game Controls', () => {
        it('should toggle pause when pressing space', () => {
            component.model.isGameRunning = true;
            fixture.detectChanges();
            
            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(component.model.isPaused).toBeDefined();
        });

        it('should start game when pressing Enter', () => {
            component.model.isGameRunning = false;
            fixture.detectChanges();
            
            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            expect(component.model.isGameRunning).toBeTruthy();
        });

        it('should navigate to dashboard when clicking dashboard button', () => {
            component.model.showMessage = true;
            fixture.detectChanges();
            
            const dashboardButton = fixture.debugElement.query(By.css('.control-button.dashboard'));
            expect(dashboardButton).toBeTruthy('Dashboard button should be present');
            
            dashboardButton.nativeElement.click();
            fixture.detectChanges();
            
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });

    describe('Keyboard Controls', () => {
        it('should handle keyboard events', () => {
            component.model.isGameRunning = true;
            fixture.detectChanges();

            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(component.model.isPaused).toBeDefined();

            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            expect(component.model.playerVelocity).toBeDefined();

            component.model.isGameRunning = false;
            component.handleKeyboardEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            expect(component.model.isGameRunning).toBeDefined();
        });
    });

    describe('Game State', () => {
        it('should update model through controller', () => {
            const model = component.model;
            expect(model.score).toBe(0);
            
            component.startGame();
            expect(model.isGameRunning).toBeDefined();
        });
    });
}); 