import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let canvas: HTMLCanvasElement;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    routerSpy.getCurrentNavigation.and.returnValue({
      extras: {
        state: {
          shipId: 1,
          userData: {
            username: 'test',
            puntosTotales: 0,
            millor_puntuacio: 0,
            total_partides: 0,
            temps_total_jugat: 0
          }
        }
      }
    } as any);

    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();

    // Crear y configurar el canvas antes de cada test
    canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');
    spyOn(canvas, 'getContext').and.returnValue(ctx);

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    
    // Asignar el canvas mockeado
    component.gameCanvas = { nativeElement: canvas };
    
    // Inicializar el componente
    component.ngOnInit();
    fixture.detectChanges();
  });

  afterEach(() => {
    // Limpiar intervalos y recursos
    if (component['gameLoop']) {
      clearInterval(component['gameLoop']);
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct values', () => {
    component.isGameRunning = false;
    fixture.detectChanges();
    expect(component.score).toBe(0);
    expect(component.isGameRunning).toBeFalse();
  });

  it('should have a canvas element with correct dimensions', () => {
    expect(component.gameCanvas.nativeElement).toBeTruthy();
    expect(component.gameCanvas.nativeElement.width).toBe(1440);
    expect(component.gameCanvas.nativeElement.height).toBe(900);
  });

  it('should get 2D context from canvas', () => {
    const canvas = component.gameCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    expect(ctx).toBeTruthy();
  });

  it('should start game when startGame is called', () => {
    component.startGame();
    expect(component.isGameRunning).toBeTrue();
    expect(component.score).toBe(0);
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
    const ctx = component.gameCanvas.nativeElement.getContext('2d');
    spyOn(ctx!, 'fillText');
    component.drawGame();
    expect(ctx!.fillText).toHaveBeenCalledWith('Punts: 0', 20, 50);
  });

  it('should show game message when not running', () => {
    // Forzar el estado inicial
    component.isGameRunning = false;
    component.showMessage = true;
    component.gameMessage = 'Prem Enter per començar';
    fixture.detectChanges();
    expect(component.showMessage).toBeTrue();
  });

  it('should hide game message when running', () => {
    component.startGame();
    expect(component.showMessage).toBeFalse();
  });
});
});
