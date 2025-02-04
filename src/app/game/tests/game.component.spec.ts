/**
 * Tests per al component de joc interficies i intereccio usuari.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from '../game.component';
import { GameController } from '../controllers/game.controller';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

describe('GameComponent', () => {
    let component: GameComponent;
    let fixture: ComponentFixture<GameComponent>;
    let controller: GameController;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [GameComponent],
            providers: [
                GameController,
                { provide: Router, useValue: routerSpy },
                { provide: PLATFORM_ID, useValue: 'browser' }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(GameComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(GameController);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(controller).toBeTruthy();
    });

    describe('User Interaction', () => {
        it('should start game when start button is clicked', () => {
            const startButton = fixture.debugElement.nativeElement.querySelector('.control-button.start');
            startButton.click();
            expect(controller.getModel().isGameRunning).toBeTrue();
        });

        it('should pause game when pause button is clicked', () => {
            controller.startGame();
            fixture.detectChanges();
            
            const pauseButton = fixture.debugElement.nativeElement.querySelector('.control-button.pause');
            pauseButton.click();
            expect(controller.getModel().isPaused).toBeTrue();
        });

        it('should navigate to dashboard when button is clicked', () => {
            const dashboardButton = fixture.debugElement.nativeElement.querySelector('.control-button.dashboard');
            dashboardButton.click();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });

    describe('Display', () => {
        it('should show current score', () => {
            controller.getModel().score = 10;
            fixture.detectChanges();
            
            const scoreElement = fixture.debugElement.nativeElement.querySelector('.score-value');
            expect(scoreElement.textContent).toContain('10');
        });

        it('should show game message when appropriate', () => {
            controller.getModel().showMessage = true;
            controller.getModel().gameMessage = 'Test Message';
            fixture.detectChanges();
            
            const messageElement = fixture.debugElement.nativeElement.querySelector('.game-message');
            expect(messageElement.textContent).toContain('Test Message');
        });
    });

    describe('Canvas Management', () => {
        it('should initialize canvas with correct dimensions', () => {
            const canvas = fixture.debugElement.nativeElement.querySelector('canvas');
            expect(canvas).toBeTruthy();
            expect(canvas.width).toBe(controller.getModel().CANVAS_WIDTH);
            expect(canvas.height).toBe(controller.getModel().CANVAS_HEIGHT);
        });
    });

    describe('Keyboard Controls', () => {
        it('should handle keyboard events', () => {
            spyOn(controller, 'jump');
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
            expect(controller.jump).toHaveBeenCalled();
        });

        it('should handle pause with spacebar', () => {
            spyOn(controller, 'togglePause');
            window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
            expect(controller.togglePause).toHaveBeenCalled();
        });
    });
}); 