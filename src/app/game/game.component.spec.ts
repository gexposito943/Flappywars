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
      component.obstacles = [{
        x: component['PLAYER_X'],
        topHeight: component.canvasHeight,  
        bottomHeight: 0,
        passed: false
      }];
      component.playerY = 0; 
      expect(component.checkCollision()).toBeTrue();
    });
  });
  describe('Game Logic', () => {
    it('should increase score when passing obstacles', () => {
      component.startGame();
      component.obstacles = [{
        x: component['PLAYER_X'] - 51, 
        topHeight: 100,
        bottomHeight: 100,
        passed: false
      }];
      component.updateScore();
      expect(component.score).toBe(1);
    });

    it('should end game on collision', () => {
      component.startGame();
      component.handleCollision();
      expect(component.isGameRunning).toBeFalse();
      expect(component.isGameLoopRunning).toBeFalse();
    });
  });
  
describe('Game UI Elements', () => {
  it('should show score display', () => {
    const scoreElement = fixture.nativeElement.querySelector('.score');
    expect(scoreElement).toBeTruthy();
    expect(scoreElement.textContent).toContain('Punts: 0');
  });

  it('should show game message when not running', () => {
    const messageElement = fixture.nativeElement.querySelector('.game-message');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain('Prem Enter per començar');
  });

  it('should hide game message when running', () => {
    component.startGame();
    fixture.detectChanges();
    const messageElement = fixture.nativeElement.querySelector('.game-message');
    expect(messageElement).toBeFalsy();
  });

  it('should have all control buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('.game-controls button');
    expect(buttons.length).toBe(4);
  });
});
});
