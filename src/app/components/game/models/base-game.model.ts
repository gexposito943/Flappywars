import { GameModel } from './game.model';
import { GameAssets } from './game-assets.model';
import { GameRenderer } from './game-renderer.model';
import { Inject, PLATFORM_ID } from '@angular/core';

//Classe base per al joc que gestiona els components principals
export abstract class BaseGame {
    protected model: GameModel;
    protected assets: GameAssets;
    protected renderer!: GameRenderer;
    protected animationFrameId: number | null = null;


    constructor(@Inject(PLATFORM_ID) protected platformId: Object) {
        this.model = new GameModel();
        this.assets = new GameAssets(platformId);
    }

    //Inicialitza el renderitzador

    protected initRenderer(context: CanvasRenderingContext2D): void {
        this.renderer = new GameRenderer(context, this.assets, this.model);
    }

    //Inicia el bucle del joc
    protected startGameLoop(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.gameLoop();
    }

    //Atura el bucle del joc

    protected stopGameLoop(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    //Bucle principal del joc

    private gameLoop(): void {
        if (!this.model.isGameRunning) return;

        
        if (!this.model.isPaused) {
            this.update();
            this.render();
        }
        
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    //Actualitza l'estat del joc

    protected update(): void {
        this.model.updatePhysics();
        this.model.updateObstacles();
        
        if (this.model.checkCollision()) {
            this.onGameOver();
        }
    }

    //Renderitza el joc

    protected render(): void {
        this.renderer.render();
    }


    //Mètode que s'ha d'implementar per gestionar el final del joc

    protected abstract onGameOver(): void;

}