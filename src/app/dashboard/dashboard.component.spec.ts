import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { GameService } from '../services/game.service';
import { RegistreService } from '../services/registre.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockGameService: jasmine.SpyObj<GameService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockRegistreService: jasmine.SpyObj<RegistreService>;

  const mockUserData = {
    username: 'TestUser',
    nivel: 5,
    puntosTotales: 1000,
    naveActual: 1
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRegistreService = jasmine.createSpyObj('RegistreService', ['logout', 'getUserData']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: GameService, useValue: jasmine.createSpyObj('GameService', ['updateUserShip']) },
        { provide: Router, useValue: mockRouter },
        { provide: RegistreService, useValue: mockRegistreService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockGameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    mockRegistreService.getUserData.and.returnValue(mockUserData);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
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
  // proves estadistiques del usuari 
  describe('User Statistics', () => {
    it('should load and display user statistics correctly', () => {
      const mockStats = {
        millor_puntuacio: 1000,
        total_partides: 50,
        temps_total_jugat: 7200 
      };
      
      mockGameService.getUserStats.and.returnValue(of(mockStats));
      component.loadUserStats();
      
      expect(component.userStats).toEqual(mockStats);
      const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
      expect(statsElements[0].textContent).toContain('1000');
      expect(statsElements[1].textContent).toContain('50');
      expect(statsElements[2].textContent).toContain('2h 0m');
    });

    it('should handle statistics loading error', () => {
      mockGameService.getUserStats.and.returnValue(throwError(() => new Error('Error loading stats')));
      
      component.loadUserStats();
      
      expect(component.userStats).toBeUndefined();
      const errorMessage = fixture.nativeElement.querySelector('.error-message');
      expect(errorMessage).toBeTruthy();
    });
  });
  //Proves de navegacio
  describe('Navigation', () => {
    it('should navigate to game when play button is clicked', () => {
      const playButton = fixture.nativeElement.querySelector('.play-button');
      playButton.click();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/game']);
    });

    it('should prevent navigation if no ship is selected', () => {
      component.selectedShipId = null;
      const playButton = fixture.nativeElement.querySelector('.play-button');
      playButton.click();
      
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
  //Proves de perfil d'usuari, tencament sessio actualizar nivell etc..
  describe('User Profile', () => {
    it('should logout user correctly', () => {
      component.logout();
      
      expect(mockRegistreService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should update user level display when experience changes', () => {
      const newUserData = {
        ...mockUserData,
        nivel: 6,
        puntosTotales: 1500
      };
      
      mockRegistreService.getUserData.and.returnValue(newUserData);
      component.updateUserData();
      
      const levelElement = fixture.nativeElement.querySelector('.user-level');
      expect(levelElement.textContent).toContain('6');
    });
  });
  //proves d'assoliments
  describe('Achievements', () => {
    it('should display user achievements', () => {
      const mockAchievements = [
        { id: 1, nom: 'Primer Vol', completat: true },
        { id: 2, nom: 'Expert', completat: false }
      ];
      
      mockGameService.getUserAchievements.and.returnValue(of(mockAchievements));
      component.loadAchievements();
      
      const achievementElements = fixture.nativeElement.querySelectorAll('.achievement-item');
      expect(achievementElements.length).toBe(2);
      expect(achievementElements[0].classList.contains('completed')).toBeTrue();
    });
  });
  it('should format statistics display correctly', () => {
    // configuracio de la prova.
    component.userStats = {
      millor_puntuacio: 1000,
      total_partides: 50,
      temps_total_jugat: 7200
    };
    fixture.detectChanges();

    const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(statsElements[0].textContent).toContain('MILLOR PUNTUACIÓ');
    expect(statsElements[1].textContent).toContain('TOTAL PARTIDES');
    expect(statsElements[2].textContent).toContain('TEMPS TOTAL JUGAT');
  });
  
  it('should display correct ship descriptions', () => {
    const shipDescriptions = fixture.nativeElement.querySelectorAll('.ship-desc');
    expect(shipDescriptions[0].textContent).toContain('Nau de combat versàtil');
    expect(shipDescriptions[1].textContent).toContain('Nau ràpida de l\'Imperi');
    expect(shipDescriptions[2].textContent).toContain('Nau llegendària');
  });
  it('should show selection message when no ship is selected', () => {
    const message = fixture.nativeElement.querySelector('.selection-message');
    expect(message.textContent).toBe('Has de seleccionar una nau abans de començar');
  });
});
