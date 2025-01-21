import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import { GameService } from '../services/game.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockGameService: jasmine.SpyObj<GameService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: GameService, useValue: jasmine.createSpyObj('GameService', ['updateUserShip']) }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockGameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values game canvas', () => {
    expect(component.score).toBe(0);
    expect(component.isGameRunning).toBeFalse();
    expect(component.canvasWidth).toBe(800);
    expect(component.canvasHeight).toBe(600);
  });
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
  
  it('should select ship and update user preferences', () => {
    // Mock de una nau disponible
    const shipId = 2;
    const mockShip = {
      id: shipId,
      nom: 'TIE Fighter',
      velocitat: 2,
      imatge_url: 'tie.png',
      descripcio: 'Nave rápida'
    };
    component.availableShips = [mockShip];
    component.selectShip(shipId);
    
    expect(component.selectedShipId).toBe(shipId);
    expect(mockGameService.updateUserShip).toHaveBeenCalledWith(shipId);
    expect(component.userData.naveActual).toBe(shipId);
  });
});
