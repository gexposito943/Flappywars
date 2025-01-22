import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { DashboardComponent } from './dashboard.component';
import { GameService } from '../services/game.service';
import { RegistreService } from '../services/registre.service';

interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
}

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
    mockGameService = jasmine.createSpyObj('GameService', ['updateUserShip', 'getUserStats', 'getUserAchievements']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockRegistreService = jasmine.createSpyObj('RegistreService', ['logout', 'getUserData']);

    mockGameService.getUserStats.and.returnValue(of({
      millor_puntuacio: 1000,
      total_partides: 50,
      temps_total_jugat: '2h 0m'
    }));

    mockGameService.getUserAchievements.and.returnValue(of([
      { id: 1, name: 'First Flight', unlocked: true },
      { id: 2, name: 'Speed Demon', unlocked: false }
    ]));

    mockRegistreService.getUserData.and.returnValue(of(mockUserData));

    mockGameService.updateUserShip.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: Router, useValue: mockRouter },
        { provide: RegistreService, useValue: mockRegistreService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    await component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should select ship and update user preferences', () => {
    const shipId = 2;
    mockGameService.updateUserShip.and.returnValue(of({}));
    
    component.selectShip(shipId);
    component.startGame();
    
    expect(mockGameService.updateUserShip).toHaveBeenCalledWith(shipId);
  });

  it('should format statistics display correctly', () => {
    component.loadUserStats();
    fixture.detectChanges();

    const statsElements = fixture.nativeElement.querySelectorAll('.stat-card');
    expect(statsElements[0].textContent.toUpperCase()).toContain('MILLOR PUNTUACIÓ');
    expect(statsElements[1].textContent.toUpperCase()).toContain('TOTAL PARTIDES');
    expect(statsElements[2].textContent.toUpperCase()).toContain('TEMPS TOTAL JUGAT');
  });

  it('should navigate to game when play button is clicked', async () => {
    component.selectedShipId = 1;
    component.startGame();
    expect(mockGameService.updateUserShip).toHaveBeenCalledWith(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/game']);
  });

  describe('User Statistics', () => {
    it('should display statistics correctly', async () => {
      const stats: UserStats = {
        millor_puntuacio: 1000,
        total_partides: 50,
        temps_total_jugat: 7200
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

  it('should enable play button when ship is selected', async () => {
    component.selectedShipId = 1;
    fixture.detectChanges();
    await fixture.whenStable();
    
    const playButton = fixture.debugElement.query(By.css('.play-button'));
    expect(playButton.nativeElement.disabled).toBeFalse();
    expect(playButton.nativeElement.textContent.trim()).toBe('Jugar');
  });
});
