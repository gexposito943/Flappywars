import { Usuari } from '../../../models/usuari.model';
import { Obstacle } from '../../../models/obstacle.model';

export class GameModel {
    // Estat del joc
    private _usuari: Usuari;
    private _score: number = 0;
    private _isRunning: boolean = false;
    private _isPaused: boolean = false;
    private _message: string = 'Prem ENTER per començar';
    private _showMessage: boolean = true;

    // Posició i física
    private _position = { x: 100, y: 450 };
    private _velocity: number = 0;
    private _obstacles: Obstacle[] = [];

    // Constants del joc
    readonly CANVAS_WIDTH: number = 1440;
    readonly CANVAS_HEIGHT: number = 900;
    readonly PLAYER_SIZE: number = 120;
    readonly GRAVITY: number = 0.5;
    readonly JUMP_FORCE: number = -10;
    readonly OBSTACLE_SPEED: number = 8;
    readonly OBSTACLE_GAP: number = 700;
    readonly COLLISION_MARGIN: number = 20;

    constructor() {
        this._usuari = new Usuari();
    }

    // Getters i Setters bàsics
    get usuari() { return this._usuari; }
    get score() { return this._score; }
    get isGameRunning() { return this._isRunning; }
    get isPaused() { return this._isPaused; }
    get gameMessage() { return this._message; }
    get showMessage() { return this._showMessage; }
    get position() { return this._position; }
    get velocity() { return this._velocity; }
    get obstacles() { return this._obstacles; }

    set usuari(value: Usuari) { this._usuari = value; }
    set score(value: number) { this._score = value; }
    set isGameRunning(value: boolean) { this._isRunning = value; }
    set isPaused(value: boolean) { this._isPaused = value; }
    set gameMessage(value: string) { this._message = value; }
    set showMessage(value: boolean) { this._showMessage = value; }
    set position(value: {x: number, y: number}) { this._position = value; }
    set velocity(value: number) { this._velocity = value; }
    set obstacles(value: Obstacle[]) { this._obstacles = value; }

    //Actualitza la física del joc
    updatePhysics(): void {
        this.velocity += this.GRAVITY;
        this.position = {
            x: this.position.x,
            y: this.position.y + this.velocity
        };
    }

    //Fa saltar la nau
    jump(): void {
        this.velocity = this.JUMP_FORCE;
    }


    //Comprova si hi ha col·lisió amb els obstacles

    checkCollision(): boolean {
        return this._obstacles.some(obstacle => {
            const inXRange = 
                this._position.x + this.COLLISION_MARGIN < obstacle.x + obstacle.width && 
                this._position.x + this.PLAYER_SIZE - this.COLLISION_MARGIN > obstacle.x;
            
            const hitTop = this._position.y + this.COLLISION_MARGIN < obstacle.topHeight;
            const hitBottom = 
                this._position.y + this.PLAYER_SIZE - this.COLLISION_MARGIN > 
                this.CANVAS_HEIGHT - obstacle.bottomHeight;
            
            return inXRange && (hitTop || hitBottom);
        });
    }

    //Actualitza els obstacles (moviment i puntuació)
    updateObstacles(): void {
        // Moure obstacles
        this._obstacles = this._obstacles.map(obs => {
            obs.x -= this.OBSTACLE_SPEED;
            if (!obs.passed && obs.x + obs.width < this._position.x) {
                obs.passed = true;
                this._score += 1;
            }
            return obs;
        });
        this._obstacles = this._obstacles.filter(obs => obs.x > -obs.width);
        // Crear nous obstacles si cal
        if (this._obstacles.length === 0 || 
            this._obstacles[this._obstacles.length - 1].x < this.CANVAS_WIDTH - this.OBSTACLE_GAP) {
            this._obstacles.push(new Obstacle(this.CANVAS_WIDTH));
        }
    }

    //Reinicia l'estat del joc
    
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