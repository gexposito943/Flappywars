/**
 * Model que gestiona l'estat del joc i els seus objectes
 * Conté la lògica de col·lisions i obstacles
 */
export interface Obstacle {
    x: number;
    topHeight: number;
    bottomHeight: number;
    passed: boolean;
}

export class GameModel {
    // Propietats privades del joc
    private _score: number = 0;
    private _isGameRunning: boolean = false;
    private _isPaused: boolean = false;
    private _playerY: number = 0;
    private _playerVelocity: number = 0;
    private _obstacles: Obstacle[] = [];
    private _gameMessage: string = 'Prem Enter per començar';
    private _showMessage: boolean = true;

    // Constants del joc
    readonly GRAVITY: number = 0.4;
    readonly JUMP_FORCE: number = -8;
    readonly OBSTACLE_SPEED: number = 6;
    readonly PLAYER_SIZE: number = 80;
    readonly PLAYER_X: number = 100;
    readonly OBSTACLE_GAP: number = 500;
    readonly OBSTACLE_WIDTH: number = 60;
    readonly GAP_SIZE: number = 220;
    readonly CANVAS_WIDTH: number = 1440;
    readonly CANVAS_HEIGHT: number = 900;

    // Getters i Setters
    get score(): number { return this._score; }
    set score(value: number) { this._score = value; }

    get isGameRunning(): boolean { return this._isGameRunning; }
    set isGameRunning(value: boolean) { this._isGameRunning = value; }

    get isPaused(): boolean { return this._isPaused; }
    set isPaused(value: boolean) { this._isPaused = value; }

    get playerY(): number { return this._playerY; }
    set playerY(value: number) { this._playerY = value; }

    get playerVelocity(): number { return this._playerVelocity; }
    set playerVelocity(value: number) { this._playerVelocity = value; }

    get obstacles(): Obstacle[] { return this._obstacles; }
    set obstacles(value: Obstacle[]) { this._obstacles = value; }

    get gameMessage(): string { return this._gameMessage; }
    set gameMessage(value: string) { this._gameMessage = value; }

    get showMessage(): boolean { return this._showMessage; }
    set showMessage(value: boolean) { this._showMessage = value; }

    /**
     * Crea un nou obstacle amb altura aleatòria
     */
    createObstacle(): Obstacle {
        const topHeight = Math.random() * (this.CANVAS_HEIGHT - this.GAP_SIZE - 100);
        return {
            x: this.CANVAS_WIDTH,
            topHeight,
            bottomHeight: this.CANVAS_HEIGHT - topHeight - this.GAP_SIZE,
            passed: false
        };
    }

    /**
     * Comprova si hi ha col·lisió entre el jugador i els obstacles
     */
    checkCollision(playerX: number, playerSize: number): boolean {
        return this._obstacles.some(obstacle => {
            const inXRange = playerX < obstacle.x + 50 && 
                           playerX + (playerSize * 0.8) > obstacle.x;
            
            const hitTop = this._playerY + (playerSize * 0.2) < obstacle.topHeight;
            const hitBottom = this._playerY + (playerSize * 0.8) > this.CANVAS_HEIGHT - obstacle.bottomHeight;
            
            return inXRange && (hitTop || hitBottom);
        });
    }

    /**
     * Reinicia l'estat del joc als valors inicials
     */
    reset(): void {
        this._score = 0;
        this._playerY = this.CANVAS_HEIGHT / 2;
        this._playerVelocity = 0;
        this._obstacles = [this.createObstacle()];
        this._isGameRunning = true;
        this._showMessage = false;
    }
} 