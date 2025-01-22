import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameComponent } from './game.component';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.score).toBe(0);
    expect(component.isGameRunning).toBeFalse();
    expect(component.canvasWidth).toBe(800);
    expect(component.canvasHeight).toBe(600);
  });
  //s'ha de moura a game
  it('should have a canvas element', () => {
    const canvasElement = fixture.nativeElement.querySelector('canvas');
    expect(canvasElement).toBeTruthy();
    expect(canvasElement.width).toBe(component.canvasWidth);
    expect(canvasElement.height).toBe(component.canvasHeight);
  });
  it('should get 2D context from canvas', () => {
    const canvas = component.gameCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    expect(ctx).toBeTruthy();
  });

  it('should start game when startGame is called', () => {
    // Verificar estado inicial
    expect(component.isGameRunning).toBeFalse();
    component.startGame();
    // verifica que el joc esta en funcionamiento
    expect(component.isGameRunning).toBeTrue();
    expect(component.score).toBe(0);
    // verifica que gameLoop esta definit 
    expect(component['gameLoop']).toBeDefined();
  });
  
  it('should stop game when stopGame is called', () => {
    component.startGame();
    expect(component.isGameRunning).toBeTrue();
    component.stopGame();
    expect(component.isGameRunning).toBeFalse();
    // Verifica que el gameLoop esta null
    expect(component['gameLoop']).toBeNull();
  });
  
  it('should pause and resume game correctly', () => {
    component.startGame();
    expect(component.isGameRunning).toBeTrue();
    component.togglePause();
    expect(component.isPaused).toBeTrue();
    expect(component.isGameRunning).toBeTrue();
    component.togglePause();
    expect(component.isPaused).toBeFalse();
    expect(component.isGameRunning).toBeTrue();
    expect(component['gameLoop']).toBeDefined();
  });
  describe('Player Mechanics', () => {
    it('should initialize player with default position', () => {
      component.startGame();
      expect(component.playerY).toBe(component.canvasHeight / 2);
      expect(component.playerVelocity).toBe(0);
    });

    it('should apply gravity to player', () => {
      component.startGame();
      const initialY = component.playerY;
      component.applyGravity();
      expect(component.playerY).toBeGreaterThan(initialY);
      expect(component.playerVelocity).toBeGreaterThan(0);
    });

    it('should make player jump', () => {
      component.startGame();
      const initialY = component.playerY;
      component.jump();
      expect(component.playerY).toBeLessThan(initialY);
      expect(component.playerVelocity).toBeLessThan(0);
    });
  });
  describe('Obstacle Mechanics', () => {
    it('should initialize obstacles array', () => {
      component.startGame();
      expect(component.obstacles.length).toBeGreaterThan(0);
    });

    it('should move obstacles left', () => {
      component.startGame();
      const initialX = component.obstacles[0].x;
      component.moveObstacles();
      expect(component.obstacles[0].x).toBeLessThan(initialX);
    });

    it('should detect collision with obstacles', () => {
      component.startGame();
      // aqui es força la colisio
      component.playerY = 0;
      expect(component.checkCollision()).toBeTrue();
      
      // Sense colisio 
      component.playerY = component.canvasHeight / 2;
      expect(component.checkCollision()).toBeFalse();
    });
  });
  describe('Game Logic', () => {
    it('should increase score when passing obstacles', () => {
      component.startGame();
      const initialScore = component.score;
      component.updateScore();
      expect(component.score).toBeGreaterThan(initialScore);
    });

    it('should end game on collision', () => {
      component.startGame();
      component.handleCollision();
      expect(component.isGameRunning).toBeFalse();
      expect(component.gameLoop).toBeNull();
    });
  });
  
});
