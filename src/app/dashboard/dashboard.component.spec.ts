import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { DashboardComponent } from './dashboard.component';
import { GameService } from '../services/game.service';
import { RegistreService } from '../services/registre.service';
import { ShipService } from '../services/ship.service';
import { fakeAsync, tick } from '@angular/core/testing';

interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
  punts_totals: number;
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockGameService: jasmine.SpyObj<GameService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRegistreService: jasmine.SpyObj<RegistreService>;
  let mockShipService: jasmine.SpyObj<ShipService>;

  const mockUserData = {
    username: 'TestUser',
    nivel: 5,
    puntosTotales: 1000,
    naveActual: 1
  };

  const mockShips = [
    {
      id: 1,
      nom: 'Nau de Combat',
      velocitat: 100,
      imatge_url: 'assets/x-wing.png',
      descripcio: 'Nau de combat versàtil',
      required_points: 0
    },
    {
      id: 2,
      nom: 'Nau Imperial',
      velocitat: 120,
      imatge_url: 'assets/tie-fighter.png',
      descripcio: 'Nau ràpida de l\'Imperi',
      required_points: 1000
    },
    {
      id: 3,
      nom: 'Nau Llegendària',
      velocitat: 150,
      imatge_url: 'assets/millenium-falcon.png',
      descripcio: 'Nau llegendària',
      required_points: 2500
    }
  ];

  beforeEach(async () => {
    mockGameService = jasmine.createSpyObj('GameService', ['updateUserShip', 'getUserStats', 'getUserAchievements']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRegistreService = jasmine.createSpyObj('RegistreService', ['logout', 'getUserData', 'setUserData']);
    mockShipService = jasmine.createSpyObj('ShipService', ['getShips']);

    mockGameService.getUserStats.and.returnValue(of({
      millor_puntuacio: 1000,
      total_partides: 50,
      temps_total_jugat: 7200,
      punts_totals: 2500
    }));

    mockGameService.getUserAchievements.and.returnValue(of([
      { id: 1, nom: 'Primer vol', completat: true },
      { id: 2, nom: 'As Espacial', completat: false }
    ]));

    mockRegistreService.getUserData.and.returnValue(mockUserData);
    mockShipService.getShips.and.returnValue(of(mockShips));
    mockGameService.updateUserShip.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: Router, useValue: mockRouter },
        { provide: RegistreService, useValue: mockRegistreService },
        { provide: ShipService, useValue: mockShipService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should select ship and update user preferences', () => {
    const shipId = 2;
    component.selectShip(shipId);
    
    expect(mockRegistreService.setUserData).toHaveBeenCalledWith({
      ...mockUserData,
      naveActual: shipId
    });
  });

  it('should format statistics display correctly', () => {
    component.loadUserStats();
    fixture.detectChanges();

    const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(statsElements[0].textContent.toUpperCase()).toContain('MILLOR PUNTUACIÓ');
    expect(statsElements[1].textContent.toUpperCase()).toContain('TOTAL PARTIDES');
    expect(statsElements[2].textContent.toUpperCase()).toContain('TEMPS TOTAL JUGAT');
  });

  it('should navigate to game when play button is clicked', fakeAsync(() => {
    component.selectedShipId = 1;
    fixture.detectChanges();

    component.startGame();
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/game'], {
      state: { 
        shipId: 1,
        userData: mockUserData
      }
    });
  }));

  describe('User Statistics', () => {
    it('should display statistics correctly', async () => {
      const stats: UserStats = {
        millor_puntuacio: 1000,
        total_partides: 50,
        temps_total_jugat: 7200,
        punts_totals: 2500
      };
      
      component.userStats = stats;
      fixture.detectChanges();
      await fixture.whenStable();
      
      const statCards = fixture.debugElement.queryAll(By.css('.stat-card'));
      expect(statCards.length).toBe(3);
    });
  });

  describe('User Profile', () => {
    it('should update user level display', async () => {
      component.userData = { ...mockUserData, nivel: 6 };
      fixture.detectChanges();
      await fixture.whenStable();
      
      const levelElement = fixture.debugElement.query(By.css('.stat-badge'));
      expect(levelElement).toBeTruthy();
      expect(levelElement.nativeElement.textContent).toContain('Nivell: 6');
    });
  });

  it('should load and display user statistics correctly', () => {
    const mockStats = {
      millor_puntuacio: 1000,
      total_partides: 50,
      temps_total_jugat: 7200,
      punts_totals: 2500
    };
    
    mockGameService.getUserStats.and.returnValue(of(mockStats));
    component.loadUserStats();
    
    expect(component.userStats).toEqual(mockStats);
    const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(statsElements[0].textContent).toContain('1000');
    expect(statsElements[1].textContent).toContain('50');
    expect(statsElements[2].textContent).toContain('2h 0m');
  });

  it('should display correct ship descriptions', () => {
    const shipDescriptions = fixture.nativeElement.querySelectorAll('.ship-desc');
    expect(shipDescriptions[0].textContent).toContain('Nau de combat versàtil');
    expect(shipDescriptions[1].textContent).toContain('Nau ràpida de l\'Imperi');
    expect(shipDescriptions[2].textContent).toContain('Nau llegendària');
  });

  it('should show selection message when no ship is selected', () => {
    component.selectedShipId = null;
    fixture.detectChanges();
    
    const playButton = fixture.debugElement.query(By.css('.play-button'));
    expect(playButton).toBeTruthy();
    expect(playButton.nativeElement.disabled).toBeTrue();
  });

  it('should enable play button when ship is selected', async () => {
    component.selectedShipId = 1;
    fixture.detectChanges();
    await fixture.whenStable();
    
    const playButton = fixture.debugElement.query(By.css('.play-button'));
    expect(playButton.nativeElement.disabled).toBeFalse();
    expect(playButton.nativeElement.textContent.trim()).toBe('Jugar');
  });

  it('should load ships on init', () => {
    expect(component.availableShips[0].imatge_url).toBe('assets/images/naus/x-wing.png');
    expect(component.availableShips[1].imatge_url).toBe('assets/images/naus/tie-fighter.png');
    expect(component.availableShips[2].imatge_url).toBe('assets/images/naus/millenium-falcon.png');
  });

  it('should handle ship loading error', () => {
    mockShipService.getShips.and.returnValue(throwError(() => new Error('Error loading ships')));
    component.loadShips();
    expect(component.availableShips).toBeDefined();
    expect(component.availableShips.length).toBeGreaterThan(0);
  });

  it('should handle stats loading error', () => {
    mockGameService.getUserStats.and.returnValue(throwError(() => new Error('Error loading stats')));
    component.loadUserStats();
    expect(component.userStats).toEqual({
      millor_puntuacio: 0,
      total_partides: 0,
      temps_total_jugat: 0,
      punts_totals: 0
    });
  });

  it('should format time correctly', () => {
    expect(component.formatTime(3665)).toBe('1h 1m');
    expect(component.formatTime(7200)).toBe('2h 0m');
    expect(component.formatTime(0)).toBe('0h 0m');
  });

  it('should not start game if no ship is selected', () => {
    component.selectedShipId = null;
    component.startGame();
    expect(mockGameService.updateUserShip).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should logout correctly', () => {
    component.logout();
    expect(mockRegistreService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
