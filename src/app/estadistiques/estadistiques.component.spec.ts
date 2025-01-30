import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { EstadistiquesComponent } from './estadistiques.component';
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';

describe('EstadistiquesComponent', () => {
  let component: EstadistiquesComponent;
  let fixture: ComponentFixture<EstadistiquesComponent>;
  let mockGameService: jasmine.SpyObj<GameService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockGlobalStats = [
    { 
      username: 'Player1', 
      punts_totals: 2500,
      millor_puntuacio: 500,
      total_partides: 10,
      temps_total_jugat: 3600
    },
    { 
      username: 'Player2', 
      punts_totals: 1800,
      millor_puntuacio: 400,
      total_partides: 8,
      temps_total_jugat: 2400
    },
    { 
      username: 'Player3', 
      punts_totals: 3200,
      millor_puntuacio: 600,
      total_partides: 15,
      temps_total_jugat: 4800
    }
  ];

  beforeEach(async () => {
    mockGameService = jasmine.createSpyObj('GameService', ['getGlobalStats']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockGameService.getGlobalStats.and.returnValue(of(mockGlobalStats));

    await TestBed.configureTestingModule({
      imports: [EstadistiquesComponent, HttpClientTestingModule],
      providers: [
        { provide: GameService, useValue: mockGameService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EstadistiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load global statistics on init', () => {
    expect(mockGameService.getGlobalStats).toHaveBeenCalled();
    expect(component.globalStats).toEqual(mockGlobalStats);
  });

  it('should display player statistics in order', () => {
    const rows = fixture.debugElement.queryAll(By.css('.stats-row'));
    expect(rows.length).toBe(3);
    expect(rows[0].nativeElement.textContent).toContain('Player3');
    expect(rows[0].nativeElement.textContent).toContain('3200');
  });

  it('should have a return button', () => {
    const returnButton = fixture.debugElement.query(By.css('.return-button'));
    expect(returnButton).toBeTruthy();
    expect(returnButton.nativeElement.textContent.trim()).toBe('Tornar al Dashboard');
  });

  it('should navigate to dashboard when return button is clicked', () => {
    const returnButton = fixture.debugElement.query(By.css('.return-button'));
    returnButton.nativeElement.click();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show loading state', () => {
    component.loading = true;
    fixture.detectChanges();
    const loadingElement = fixture.debugElement.query(By.css('.loading-error'));
    expect(loadingElement).toBeTruthy();
    expect(loadingElement.nativeElement.textContent).toContain('Carregant estadístiques');
  });

  it('should show error state', () => {
    component.error = true;
    fixture.detectChanges();
    
    const errorElement = fixture.debugElement.query(By.css('.loading-error'));
    expect(errorElement).toBeTruthy();
    expect(errorElement.nativeElement.textContent).toContain('Error carregant les estadístiques');
  });

  it('should show message when no statistics are available', () => {
    component.globalStats = [];
    fixture.detectChanges();
    
    const noStatsElement = fixture.debugElement.query(By.css('.no-stats'));
    expect(noStatsElement).toBeTruthy();
    expect(noStatsElement.nativeElement.textContent).toContain('No hi ha estadístiques disponibles');
  });

  it('should display all player statistics fields correctly', () => {
    const firstRow = fixture.debugElement.queryAll(By.css('.stats-row'))[0];
    expect(firstRow.nativeElement.textContent).toContain('Player3');
    expect(firstRow.nativeElement.textContent).toContain('3200');
    expect(firstRow.nativeElement.textContent).toContain('600');
    expect(firstRow.nativeElement.textContent).toContain('15');
    expect(firstRow.nativeElement.textContent).toContain('1h 20m');
  });

  it('should format time correctly', () => {
    expect(component.formatTime(3665)).toBe('1h 1m 5s');
    expect(component.formatTime(65)).toBe('1m 5s');
    expect(component.formatTime(30)).toBe('30s');
  });

  it('should sort players by total points', () => {
    const rows = fixture.debugElement.queryAll(By.css('.stats-row'));
    const firstPlayerPoints = rows[0].nativeElement.textContent;
    const lastPlayerPoints = rows[2].nativeElement.textContent;
    
    expect(firstPlayerPoints).toContain('3200');
    expect(lastPlayerPoints).toContain('1800');
  });
});