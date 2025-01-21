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
  //proves estadistiques del usuari 
  escribe('User Statistics', () => {
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
  escribe('Achievements', () => {
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
