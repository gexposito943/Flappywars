/**
 * Model que gestiona l'estat del joc i els seus objectes
 * Conté la lògica de col·lisions i obstacles
 */
import { Player } from './player.model';
import { Obstacle } from './obstacle.model';

export class GameModel {
    private _player: Player;
    private _obstacles: Obstacle[];
    private _score: number;
    private _isGameRunning: boolean;
    private _isPaused: boolean;
    private _gameMessage: string;
    private _showMessage: boolean;

    // Constants
    readonly GRAVITY: number = 0.4;
    readonly JUMP_FORCE: number = -8;
    readonly OBSTACLE_SPEED: number = 5;
    readonly OBSTACLE_GAP: number = 700;
    readonly CANVAS_WIDTH: number = 1440;
    readonly CANVAS_HEIGHT: number = 900;

    constructor() {
        this._player = new Player();
        this._obstacles = [];
        this._score = 0;
        this._isGameRunning = false;
        this._isPaused = false;
        this._gameMessage = 'Prem Enter per començar';
        this._showMessage = true;
    }

    get player(): Player { return this._player; }
    get obstacles(): Obstacle[] { return this._obstacles; }
    get score(): number { return this._score; }
    get isGameRunning(): boolean { return this._isGameRunning; }
    get isPaused(): boolean { return this._isPaused; }
    get gameMessage(): string { return this._gameMessage; }
    get showMessage(): boolean { return this._showMessage; }

    set obstacles(value: Obstacle[]) { this._obstacles = value; }
    set score(value: number) { this._score = value; }
    set isGameRunning(value: boolean) { this._isGameRunning = value; }
    set isPaused(value: boolean) { this._isPaused = value; }
    set gameMessage(value: string) { this._gameMessage = value; }
    set showMessage(value: boolean) { this._showMessage = value; }

    /**
     * Crea un nou obstacle amb altura aleatòria
     */
    createObstacle(): Obstacle {
        return new Obstacle(this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
    }

    /**
     * Comprova si hi ha col·lisió entre el jugador i els obstacles
     */
    checkCollision(): boolean {
        return this._obstacles.some(obstacle => {
            const inXRange = this._player.x < obstacle.x + obstacle.width && 
                           this._player.x + (this._player.size * 0.8) > obstacle.x;
            
            const hitTop = this._player.y + (this._player.size * 0.2) < obstacle.topHeight;
            const hitBottom = this._player.y + (this._player.size * 0.8) > this.CANVAS_HEIGHT - obstacle.bottomHeight;
            
            return inXRange && (hitTop || hitBottom);
        });
    }

    /**
     * Reinicia l'estat del joc als valors inicials
     */
    reset(): void {
        this._score = 0;
        this._player.reset();
        this._obstacles = [this.createObstacle()];
        this._isGameRunning = true;
        this._showMessage = false;
    }
} 