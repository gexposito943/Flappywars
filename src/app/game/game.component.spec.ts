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
});
