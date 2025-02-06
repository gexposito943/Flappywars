export class Player {
    private _x: number;
    private _y: number;
    private _velocity: number;
    private _size: number;
    private _shipId: string;
    private _shipImage: string;

    constructor() {
        this._x = 100;
        this._y = 450;
        this._velocity = 0;
        this._size = 120;
        this._shipId = '';
        this._shipImage = 'assets/images/naus/x-wing.png';
    }

    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get velocity(): number { return this._velocity; }
    get size(): number { return this._size; }
    get shipId(): string { return this._shipId; }
    get shipImage(): string { return this._shipImage; }

    set y(value: number) { this._y = value; }
    set velocity(value: number) { this._velocity = value; }
    set shipId(value: string) { this._shipId = value; }
    set shipImage(value: string) { this._shipImage = value; }

    reset(): void {
        this._y = 450;
        this._velocity = 0;
    }
} 