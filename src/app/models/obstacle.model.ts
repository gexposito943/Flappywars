
export class Obstacle {
    x: number;
    width: number = 180;
    topHeight: number;
    bottomHeight: number;
    passed: boolean = false;

    constructor(canvasWidth: number) {
        this.x = canvasWidth;
        const gap = 250;
        const minHeight = 100;
        const maxHeight = 500;
        
        this.topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;
        this.bottomHeight = 900 - (this.topHeight + gap);
    }

    private _imatge_url: string = '';
    static readonly GAP_SIZE: number = 250;

    get imatge_url(): string { return this._imatge_url; }

    set imatge_url(value: string) { this._imatge_url = value; }

    updatePosition(speed: number): void {
        this.x -= speed;
    }

    isOffscreen(): boolean {
        return this.x + this.width < 0;
    }
} 