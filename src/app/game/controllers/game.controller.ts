/**
 * Controlador que gestiona la lògica del joc
 * Gestiona les interaccions i l'estat del joc
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService, GameResult } from '../../services/game.service';
import { RegistreService } from '../../services/registre.service';
import { GameModel } from '../models/game.model';
import { BaseController } from '../core/base.controller';

@Injectable()
export class GameController extends BaseController<GameModel> {
    private gameLoop: any = null;
    private gameStartTime: number = 0;
    private playerImage: HTMLImageElement;

    constructor(
        private router: Router,
        private gameService: GameService,
        private registreService: RegistreService
    ) {
        super(new GameModel());
        this.playerImage = new Image();
        this.playerImage.src = 'assets/images/naus/x-wing.png';
    }

    /**
     * Inicia una nova partida
     */
    startGame(): void {
        if (this.model.isGameRunning) return;
        
        this.model.reset();
        this.gameStartTime = Date.now();
        this.gameLoop = setInterval(() => this.updateGame(), 1000 / 60);
    }

    /**
     * Atura la partida i guarda els resultats
     */
    stopGame(): void {
        this.model.isGameRunning = false;
        this.model.showMessage = true;
        this.model.gameMessage = `Game Over - Puntuació: ${this.model.score}`;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.saveGameResults();
    }

    /**
     * Pausa o reprèn la partida
     */
    togglePause(): void {
        this.model.isPaused = !this.model.isPaused;
        if (this.model.isPaused) {
            clearInterval(this.gameLoop);
        } else {
            this.gameLoop = setInterval(() => this.updateGame(), 1000 / 60);
        }
    }

    /**
     * Fa saltar el jugador
     */
    jump(): void {
        if (!this.model.isGameRunning) return;
        this.model.playerVelocity = this.model.JUMP_FORCE;
    }

    /**
     * Actualitza l'estat del joc
     */
    private updateGame(): void {
        if (this.model.isPaused) return;

        this.applyGravity();
        this.moveObstacles();
        this.updateScore();
        
        if (this.checkCollisions()) {
            this.stopGame();
            return;
        }
        
        this.manageObstacles();
    }

    /**
     * Aplica la gravetat al jugador
     */
    private applyGravity(): void {
        this.model.playerVelocity += this.model.GRAVITY;
        this.model.playerY += this.model.playerVelocity;
    }

    /**
     * Mou els obstacles cap a l'esquerra
     */
    private moveObstacles(): void {
        this.model.obstacles = this.model.obstacles.map(obstacle => ({
            ...obstacle,
            x: obstacle.x - this.model.OBSTACLE_SPEED
        }));
    }

    /**
     * Actualitza la puntuació
     */
    private updateScore(): void {
        const passedObstacle = this.model.obstacles.find(obstacle => 
            obstacle.x + 50 < this.model.PLAYER_X && !obstacle.passed
        );
        if (passedObstacle) {
            this.model.score++;
            passedObstacle.passed = true;
        }
    }

    /**
     * Comprova les col·lisions
     */
    private checkCollisions(): boolean {
        return this.model.checkCollision(this.model.PLAYER_X, this.model.PLAYER_SIZE);
    }

    /**
     * Gestiona la creació i eliminació d'obstacles
     */
    private manageObstacles(): void {
        if (this.model.obstacles.length === 0 || 
            this.model.obstacles[this.model.obstacles.length - 1].x < this.model.CANVAS_WIDTH - this.model.OBSTACLE_GAP) {
            this.model.obstacles.push(this.model.createObstacle());
        }
        
        this.model.obstacles = this.model.obstacles.filter(obstacle => 
            obstacle.x > -this.model.OBSTACLE_WIDTH
        );
    }

    /**
     * Guarda els resultats de la partida
     */
    public saveGameResults(): void {
        const gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        
        const gameResult: GameResult = {
            usuari_id: 1, // Aquest valor s'hauria d'obtenir del servei d'usuari
            puntuacio: this.model.score,
            duracio_segons: gameTime,
            nau_utilitzada: 1, // Aquest valor s'hauria d'obtenir de la configuració
            nivell_dificultat: 'normal',
            obstacles_superats: this.model.score,
            completada: true
        };

        this.gameService.saveGameResults(gameResult).subscribe({
            next: () => {
                this.model.gameMessage = 'Partida guardada! Prem Enter per tornar a jugar';
            },
            error: () => {
                this.model.gameMessage = 'Error al guardar la partida';
            }
        });
    }

    /**
     * Torna al dashboard
     */
    goToDashboard(): void {
        this.stopGame();
        this.router.navigate(['/dashboard']);
    }

    /**
     * Retorna si el bucle del joc està en execució
     */
    get isGameLoopRunning(): boolean {
        return this.gameLoop !== null;
    }
} 