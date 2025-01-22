import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
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
    mockGameService = jasmine.createSpyObj('GameService', ['updateUserShip', 'getUserStats', 'getUserAchievements']);
    
    mockGameService.getUserStats.and.returnValue(of({
      millor_puntuacio: 1000,
      total_partides: 50,
      temps_total_jugat: '2h 0m'
    }));

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        DashboardComponent  // Cambiado de declarations a imports
      ],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: Router, useValue: mockRouter },
        { provide: RegistreService, useValue: mockRegistreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    mockRegistreService.getUserData.and.returnValue(mockUserData);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should select ship and update user preferences', () => {
    const shipId = 2;
    const mockShip = {
      id: shipId,
      nom: 'TIE Fighter',
      velocitat: 2,
      imatge_url: 'tie.png',
      descripcio: 'Nave rápida'
    };
    
    component.availableShips = [mockShip];
    component.userData = { ...mockUserData, naveActual: 1 }; 
    
    component.selectShip(shipId);
    fixture.detectChanges();
    
    expect(component.selectedShipId).toBe(shipId);
    expect(mockGameService.updateUserShip).toHaveBeenCalledWith(shipId);
  });

  it('should format statistics display correctly', () => {
    const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(statsElements[0].textContent).toContain('MILLOR PUNTUACIÓ');
    expect(statsElements[1].textContent).toContain('TOTAL PARTIDES');
    expect(statsElements[2].textContent).toContain('TEMPS TOTAL JUGAT');
  });

  it('should navigate to game when play button is clicked', () => {
    component.selectedShipId = 1; 
    fixture.detectChanges();
    
    const playButton = fixture.nativeElement.querySelector('.play-button');
    playButton.click();
    fixture.detectChanges();
    
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/game']);
  });

  describe('User Statistics', () => {
    it('should handle statistics loading error', () => {
      mockGameService.getUserStats.and.returnValue(throwError(() => new Error('Error loading stats')));
      component.loadUserStats();
      fixture.detectChanges();
      
      const errorMessage = fixture.nativeElement.querySelector('.error-message');
      expect(errorMessage).toBeTruthy();
    });
  });

  describe('Achievements', () => {
    it('should display user achievements', () => {
      const mockAchievements = [
        { id: 1, name: 'First Flight', unlocked: true },
        { id: 2, name: 'Speed Demon', unlocked: false }
      ];
      mockGameService.getUserAchievements.and.returnValue(of(mockAchievements));
      
      component.loadAchievements();
      fixture.detectChanges();
      
      const achievements = fixture.nativeElement.querySelectorAll('.achievement');
      expect(achievements.length).toBe(2);
      expect(achievements[0].classList.contains('unlocked')).toBeTrue();
    });
  });

  describe('User Profile', () => {
    it('should update user level display when experience changes', () => {
      component.userData = { ...mockUserData, nivel: 6 };
      fixture.detectChanges();
      
      const levelElement = fixture.nativeElement.querySelector('.user-level');
      expect(levelElement.textContent).toContain('6');
    });
  });

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
