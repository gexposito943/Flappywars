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

    
    //Carrega totes les imatges del joc
    async loadAll(): Promise<void> {
        this._background.src = 'assets/images/starwars1.jpeg';
        this._ship.src = 'assets/images/naus/x-wing.png';
        this._obstacle.src = 'assets/images/obstacles/asteroide.png';

        await Promise.all([
            new Promise(resolve => this._background.onload = resolve),
            new Promise(resolve => this._ship.onload = resolve),
            new Promise(resolve => this._obstacle.onload = resolve)
        ]);
    }
}