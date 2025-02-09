import { GameModel } from './game.model';
import { GameAssets } from './game-assets.model';
import { Obstacle } from '../../../models/obstacle.model';

export class GameRenderer {
    private ctx: CanvasRenderingContext2D;
    private assets: GameAssets;
    private model: GameModel;

    constructor(
        context: CanvasRenderingContext2D, 
        assets: GameAssets,
        gameModel: GameModel
    ) {
        this.ctx = context;
        this.assets = assets;
        this.model = gameModel;
    }

    //Neteja i renderitza tot el canvas
     
    render(): void {
        this.clear();
        this.drawBackground();
        this.drawObstacles();
        this.drawShip();
    }

    //Neteja el canvas
    private clear(): void {
        this.ctx.clearRect(0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);
    }


    //Dibuixa el fons del joc
     
    private drawBackground(): void {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.model.CANVAS_WIDTH, this.model.CANVAS_HEIGHT);
        this.ctx.drawImage(
            this.assets.background, 
            0, 
            0, 
            this.model.CANVAS_WIDTH, 
            this.model.CANVAS_HEIGHT
        );
    }

    //Dibuixa tots els obstacles
     
    private drawObstacles(): void {
        this.model.obstacles.forEach((obs: Obstacle) => {
            // Obstacle superior
            this.ctx.drawImage(
                this.assets.obstacle,
                obs.x,
                0,
                obs.width,
                obs.topHeight
            );
            
            // Obstacle inferior
            this.ctx.drawImage(
                this.assets.obstacle,
                obs.x,
                this.model.CANVAS_HEIGHT - obs.bottomHeight,
                obs.width,
                obs.bottomHeight
            );
        });
    }

    //Dibuixa la nau del jugador
     
    private drawShip(): void {
        this.ctx.drawImage(
            this.assets.ship,
            this.model.position.x,
            this.model.position.y,
            this.model.PLAYER_SIZE,
            this.model.PLAYER_SIZE
        );
    }
}