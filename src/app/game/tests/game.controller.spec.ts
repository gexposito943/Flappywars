/**
 * Tests per al controlador del joc
 */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameController } from '../controllers/game.controller';
import { GameService } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { of, throwError } from 'rxjs';

describe('GameController', () => {
    let controller: GameController;
    let gameService: jasmine.SpyObj<GameService>;
    let registreService: jasmine.SpyObj<RegistreService>;
    let router: jasmine.SpyObj<Router>;

    beforeEach(() => {
        gameService = jasmine.createSpyObj('GameService', ['saveGameResults']);
        registreService = jasmine.createSpyObj('RegistreService', ['setUserData']);
        router = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                GameController,
                { provide: GameService, useValue: gameService },
                { provide: RegistreService, useValue: registreService },
                { provide: Router, useValue: router }
            ]
        });

        controller = TestBed.inject(GameController);
    });

    describe('Game Management', () => {
        it('should start game correctly', () => {
            controller.startGame();
            const model = controller.getModel();
            
            expect(model.isGameRunning).toBeTrue();
            expect(model.score).toBe(0);
            expect(model.obstacles.length).toBeGreaterThan(0);
        });

        it('should stop game correctly', () => {
            controller.startGame();
            controller.stopGame();
            const model = controller.getModel();
            
            expect(model.isGameRunning).toBeFalse();
            expect(model.showMessage).toBeTrue();
            expect(controller.isGameLoopRunning).toBeFalse();
        });

        it('should handle pause correctly', () => {
            controller.startGame();
            controller.togglePause();
            expect(controller.getModel().isPaused).toBeTrue();
            
            controller.togglePause();
            expect(controller.getModel().isPaused).toBeFalse();
        });
    });

    describe('Game Mechanics', () => {
        it('should make player jump', () => {
            controller.startGame();
            const initialVelocity = controller.getModel().playerVelocity;
            controller.jump();
            expect(controller.getModel().playerVelocity).toBeLessThan(initialVelocity);
        });
    });

    describe('Save Results', () => {
        it('should save results successfully', (done) => {
            gameService.saveGameResults.and.returnValue(of({}));
            controller.startGame();
            controller.stopGame();
            
            setTimeout(() => {
                expect(gameService.saveGameResults).toHaveBeenCalled();
                expect(controller.getModel().gameMessage).toContain('Partida guardada');
                done();
            });
        });

        it('should handle save errors', (done) => {
            gameService.saveGameResults.and.returnValue(throwError(() => new Error()));
            controller.startGame();
            controller.stopGame();
            
            setTimeout(() => {
                expect(controller.getModel().gameMessage).toContain('Error');
                done();
            });
        });
    });
}); 