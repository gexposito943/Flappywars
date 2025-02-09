import { Usuari } from '../../../models/usuari.model';
import { Obstacle } from '../../../models/obstacle.model';

export class GameModel {
    // Estado del juego
    private _usuari: Usuari;
    private _score: number = 0;
    private _isRunning: boolean = false;
    private _isPaused: boolean = false;
    private _message: string = 'Presiona ENTER para empezar';
    private _showMessage: boolean = true;

    // Posición y física
    private _position = { x: 100, y: 450 };
    private _velocity: number = 0;
    private _obstacles: Obstacle[] = [];

    // Constantes
    readonly GRAVITY: number = 0.5;
    readonly JUMP_FORCE: number = -10;
    readonly CANVAS_WIDTH: number = 1440;
    readonly CANVAS_HEIGHT: number = 900;
    readonly PLAYER_SIZE: number = 120;
    readonly OBSTACLE_SPEED: number = 5;
    readonly OBSTACLE_GAP: number = 700;

    constructor() {
        this._usuari = new Usuari();
    }

    // Getters
    get usuari() { return this._usuari; }
    get score() { return this._score; }
    get isGameRunning() { return this._isRunning; }
    get isPaused() { return this._isPaused; }
    get gameMessage() { return this._message; }
    get showMessage() { return this._showMessage; }
    get position() { return this._position; }
    get obstacles() { return this._obstacles; }
    get velocity() { return this._velocity; }

    // Setters
    set usuari(value: Usuari) { this._usuari = value; }
    set score(value: number) { this._score = value; }
    set isGameRunning(value: boolean) { this._isRunning = value; }
    set isPaused(value: boolean) { this._isPaused = value; }
    set gameMessage(value: string) { this._message = value; }
    set showMessage(value: boolean) { this._showMessage = value; }
    set position(value: {x: number, y: number}) { this._position = value; }
    set velocity(value: number) { this._velocity = value; }
    set obstacles(value: Obstacle[]) { this._obstacles = value; }

    /**
     * Crea un nou obstacle amb altura aleatòria
     */
    createObstacle(): Obstacle {
        return new Obstacle(this.CANVAS_WIDTH);
    }

    /**
     * Comprova si hi ha col·lisió entre el jugador i els obstacles
     */
    checkCollision(): boolean {
        return this._obstacles.some(obstacle => {
            // Reducir el área de colisión usando un margen
            const collisionMargin = 20; // Margen de tolerancia
            
            const inXRange = 
                this._position.x + collisionMargin < obstacle.x + obstacle.width && 
                this._position.x + this.PLAYER_SIZE - collisionMargin > obstacle.x;
            
            const hitTop = this._position.y + collisionMargin < obstacle.topHeight;
            const hitBottom = 
                this._position.y + this.PLAYER_SIZE - collisionMargin > 
                this.CANVAS_HEIGHT - obstacle.bottomHeight;
            
            return inXRange && (hitTop || hitBottom);
        });
    }

    /**
     * Reinicia l'estat del joc als valors inicials
     */
    reset(): void {
        this._score = 0;
        this._position = { x: 100, y: 450 };
        this._velocity = 0;
        this._obstacles = [new Obstacle(this.CANVAS_WIDTH)];
        this._isRunning = true;
        this._showMessage = false;
        this._isPaused = false;
    }
} 