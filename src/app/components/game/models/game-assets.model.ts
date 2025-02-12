import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

export class GameAssets {
    private _background!: HTMLImageElement;
    private _ship!: HTMLImageElement;
    private _obstacle!: HTMLImageElement;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this._background = new Image();
            this._ship = new Image();
            this._obstacle = new Image();
        }
    }

    // Getters
    get background(): HTMLImageElement { return this._background; }
    get ship(): HTMLImageElement { return this._ship; }
    get obstacle(): HTMLImageElement { return this._obstacle; }

    // Método para actualizar la imagen de la nave
    async updateShipImage(imageUrl: string): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) return;

        this._ship = new Image();
        this._ship.src = imageUrl;

        return new Promise((resolve) => {
            this._ship.onload = () => resolve();
        });
    }
    
    //Carrega totes les imatges del joc
    async loadAll(): Promise<void> {
        this._background.src = 'assets/images/starwars1.jpeg';
        // No establecemos la imagen de la nave aquí, se hará después
        this._obstacle.src = 'assets/images/obstacles/asteroide.png';

        await Promise.all([
            new Promise(resolve => this._background.onload = resolve),
            new Promise(resolve => this._obstacle.onload = resolve)
        ]);
    }
}