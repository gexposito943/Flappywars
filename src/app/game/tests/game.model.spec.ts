/**
 * Tests per al model del joc
 */
import { GameModel } from '../models/game.model';

describe('GameModel', () => {
    let model: GameModel;

    beforeEach(() => {
        model = new GameModel();
    });

    describe('Initialization', () => {
        it('should create with default values', () => {
            expect(model.score).toBe(0);
            expect(model.isGameRunning).toBeFalse();
            expect(model.isPaused).toBeFalse();
            expect(model.obstacles).toEqual([]);
        });
    });

    describe('Obstacle Management', () => {
        it('should create valid obstacle', () => {
            const obstacle = model.createObstacle();
            expect(obstacle.x).toBe(model.CANVAS_WIDTH);
            expect(obstacle.topHeight).toBeLessThan(model.CANVAS_HEIGHT - model.GAP_SIZE);
            expect(obstacle.passed).toBeFalse();
        });

        it('should detect collisions correctly', () => {
            model.obstacles = [{
                x: model.PLAYER_X,
                topHeight: model.CANVAS_HEIGHT,
                bottomHeight: 0,
                passed: false
            }];
            model.playerY = 0;
            expect(model.checkCollision(model.PLAYER_X, model.PLAYER_SIZE)).toBeTrue();
        });
    });

    describe('Game Reset', () => {
        it('should reset all values', () => {
            model.score = 10;
            model.playerY = 100;
            model.playerVelocity = 5;
            model.reset();
            
            expect(model.score).toBe(0);
            expect(model.playerY).toBe(model.CANVAS_HEIGHT / 2);
            expect(model.playerVelocity).toBe(0);
            expect(model.obstacles.length).toBe(1);
            expect(model.isGameRunning).toBeTrue();
            expect(model.showMessage).toBeFalse();
        });
    });
}); 