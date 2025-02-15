import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstadistiquesComponent } from '../estadistiques.component';
import { GameService } from '../../../services/game.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { fakeAsync, tick } from '@angular/core/testing';

describe('EstadistiquesComponent', () => {
    let component: EstadistiquesComponent;
    let fixture: ComponentFixture<EstadistiquesComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRouter: jasmine.SpyObj<Router>;

    const mockStats = [
        { 
            id: '1',
            nom_usuari: 'Player2',
            punts_totals: 3200,
            millor_puntuacio: 600,
            temps_total_jugat: 4800,
            estat: 'actiu'
        },
        { 
            id: '2',
            nom_usuari: 'Player1',
            punts_totals: 2500,
            millor_puntuacio: 500,
            temps_total_jugat: 3600,
            estat: 'actiu'
        },
        { 
            id: '3',
            nom_usuari: 'Player3',
            punts_totals: 1000,
            millor_puntuacio: 300,
            temps_total_jugat: 1800,
            estat: 'inactiu' 
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
        tick();
        fixture.detectChanges();
        expect(mockGameService.getGlobalStats).toHaveBeenCalled();
        expect(component.model.estadistiques.length).toBe(2); 
    }));

    it('should sort statistics by total points', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        const stats = component.model.estadistiques;
        expect(stats[0].punts_totals).toBeGreaterThan(stats[1].punts_totals);
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

        const rows = fixture.debugElement.queryAll(By.css('.stats-row'));
        const firstRowCells = rows[0].queryAll(By.css('.stats-cell'));
        
        expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('Player2');
        expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('3,200');
        expect(firstRowCells[3].nativeElement.textContent.trim()).toBe('600');
        expect(firstRowCells[4].nativeElement.textContent.trim()).toBe('1h 20m 0s');
    }));

    it('should show loading state initially', () => {
        component.model.loading = true;
        fixture.detectChanges();

        const loadingElement = fixture.debugElement.query(By.css('.loading-error'));
        expect(loadingElement).toBeTruthy();
        expect(loadingElement.nativeElement.textContent).toContain('Carregant estadístiques');
    });

    it('should show error state when there is an error', () => {
        component.model.error = true;
        fixture.detectChanges();

        const errorElement = fixture.debugElement.query(By.css('.loading-error'));
        expect(errorElement).toBeTruthy();
        expect(errorElement.nativeElement.textContent).toContain('Error carregant les estadístiques');
    });

    it('should format time correctly for different durations', () => {
        expect(component.formatTime(3665)).toBe('1h 1m 5s');
        expect(component.formatTime(65)).toBe('1m 5s');
        expect(component.formatTime(30)).toBe('30s');
    });

    it('should navigate to dashboard when return button is clicked', () => {
        const returnButton = fixture.debugElement.query(By.css('.return-button'));
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

        const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
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

        const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
        expect(rows.length).toBe(2); // Solo los usuarios activos
    }));

    it('should be case insensitive when searching', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        
        component.searchTerm = 'player2';
        component.filterEstadistiques();
        fixture.detectChanges();

        const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
        expect(rows.length).toBe(1);
        expect(rows[0].query(By.css('td:nth-child(2)')).nativeElement.textContent.trim())
            .toBe('Player2');
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