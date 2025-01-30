import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { EstadistiquesComponent } from './estadistiques.component';
import { GameService } from '../services/game.service';

describe('StatisticsComponent', () => {
  let component: EstadistiquesComponent;
  let fixture: ComponentFixture<EstadistiquesComponent>;
  let mockGameService: jasmine.SpyObj<GameService>;

  const mockGlobalStats = [
    { username: 'Player1', punts_totals: 2500 },
    { username: 'Player2', punts_totals: 1800 },
    { username: 'Player3', punts_totals: 3200 }
  ];

  beforeEach(async () => {
    mockGameService = jasmine.createSpyObj('GameService', ['getGlobalStats']);
    mockGameService.getGlobalStats.and.returnValue(of(mockGlobalStats));

    await TestBed.configureTestingModule({
      imports: [EstadistiquesComponent, HttpClientTestingModule],
      providers: [
        { provide: GameService, useValue: mockGameService }
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
});