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
    { username: 'Player1', punts_totals: 2500 },
    { username: 'Player2', punts_totals: 1800 },
    { username: 'Player3', punts_totals: 3200 }
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
});