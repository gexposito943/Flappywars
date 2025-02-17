import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstadistiquesComponent } from '../estadistiques.component';
import { GameService } from '../../../services/game.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { fakeAsync, tick } from '@angular/core/testing';
import { GlobalStats } from '../../../interfaces/base-stats.interface';

describe('EstadistiquesComponent', () => {
    let component: EstadistiquesComponent;
    let fixture: ComponentFixture<EstadistiquesComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRouter: jasmine.SpyObj<Router>;

    const mockStats: GlobalStats[] = [
        { 
            username: 'Player2',
            punts_totals: 3200,
            millor_puntuacio: 600,
            temps_total_jugat: 4800,
            total_partides: 10
        },
        { 
            username: 'Player1',
            punts_totals: 2500,
            millor_puntuacio: 500,
            temps_total_jugat: 3600,
            total_partides: 8
        }
    ];

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['getGlobalStats']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService.getGlobalStats.and.returnValue(of(mockStats as any));

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

    it('should load statistics on init', fakeAsync(() => {
        component.ngOnInit();
        tick();
        fixture.detectChanges();
        
        expect(component.filteredEstadistiques.length).toBe(2);
    }));

    it('should sort statistics by total points', fakeAsync(() => {
        component.model.setEstadistiquesFromGlobalStats(mockStats as GlobalStats[]);
        fixture.detectChanges();
        
        const firstRow = fixture.debugElement.query(By.css('tbody tr:first-child'));
        expect(firstRow.nativeElement.textContent).toContain('Player2');
    }));

    it('should filter out inactive users', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        const inactiveUser = component.model.estadistiques.find(stat => 
            stat.username === 'Player3'
        );

        expect(inactiveUser).toBeUndefined();
    }));

    it('should display player statistics correctly', fakeAsync(() => {
        tick();
        fixture.detectChanges();

        const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
        const firstRowCells = rows[0].queryAll(By.css('.stats-cell'));
        
        expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('Player2');
        expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('3,200');
        expect(firstRowCells[3].nativeElement.textContent.trim()).toBe('600');
        expect(firstRowCells[4].nativeElement.textContent.trim()).toBe('1h 20m 0s');
    }));

    it('should show loading state initially', () => {
        component.model.loading = true;
        fixture.detectChanges();

        const loadingElement = fixture.debugElement.query(By.css('.loading'));
        expect(loadingElement).toBeTruthy();
    });

    it('should show error state when there is an error', () => {
        component.model.error = true;
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('.no-data'));
        expect(errorElement).toBeTruthy();
        expect(errorElement.nativeElement.textContent).toContain('Error carregant les estadístiques');
    });

    it('should format time correctly for different durations', () => {
        expect(component.formatTime(65)).toBe('1m 5s');
        expect(component.formatTime(30)).toBe('30s');
    });

    it('should navigate to dashboard when return button is clicked', () => {
        const returnButton = fixture.debugElement.query(By.css('.btn-return'));
        returnButton.nativeElement.click();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should show message when no statistics are available', fakeAsync(() => {
        mockGameService.getGlobalStats.and.returnValue(of({ success: false, ranking: [] } as any));
        component.ngOnInit();
        tick();
        fixture.detectChanges();

        const noStatsElement = fixture.debugElement.query(By.css('.no-stats'));
        expect(noStatsElement).toBeTruthy();
        expect(noStatsElement.nativeElement.textContent.trim())
            .toBe('No hi ha estadístiques disponibles');
    }));

    it('should filter players by search term', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        
        component.searchTerm = 'Player2';
        component.filterEstadistiques();
        fixture.detectChanges();

        const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
        expect(rows.length).toBe(1);
        expect(rows[0].query(By.css('td:nth-child(2)')).nativeElement.textContent.trim())
            .toBe('Player2');
    }));

    it('should show all players when search term is empty', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        
        component.searchTerm = '';
        component.filterEstadistiques();
        fixture.detectChanges();

        const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
        expect(rows.length).toBe(2); // Solo los usuarios activos
    }));

    it('should be case insensitive when searching', fakeAsync(() => {
        component.searchTerm = 'PLAYER2';
        component.filterEstadistiques();
        fixture.detectChanges();

        const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));
        expect(rows.length).toBe(1);
    }));

    it('should show no results message when search has no matches', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        
        component.searchTerm = 'NonexistentPlayer';
        component.filterEstadistiques();
        fixture.detectChanges();

        const noResultsMessage = fixture.debugElement.query(By.css('.no-data'));
        expect(noResultsMessage).toBeTruthy();
        expect(noResultsMessage.nativeElement.textContent.trim())
            .toBe('No hi ha estadístiques disponibles');
    }));
}); 