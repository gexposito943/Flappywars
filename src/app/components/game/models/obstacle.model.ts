export class Obstacle {
    private _x: number;
    private _topHeight: number;
    private _bottomHeight: number;
    private _passed: boolean;
    private _width: number;
    static readonly GAP_SIZE: number = 250;

    constructor(canvasWidth: number, canvasHeight: number) {
        this._x = canvasWidth;
        this._topHeight = Math.random() * (canvasHeight - Obstacle.GAP_SIZE - 100);
        this._bottomHeight = canvasHeight - this._topHeight - Obstacle.GAP_SIZE;
        this._passed = false;
        this._width = 60;
    }

    get x(): number { return this._x; }
    get topHeight(): number { return this._topHeight; }
    get bottomHeight(): number { return this._bottomHeight; }
    get passed(): boolean { return this._passed; }
    get width(): number { return this._width; }

    set x(value: number) { this._x = value; }
    set passed(value: boolean) { this._passed = value; }
} 