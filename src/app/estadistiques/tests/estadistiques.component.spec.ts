import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EstadistiquesComponent } from '../estadistiques.component';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { EstadistiquesController } from '../controllers/estadistiques.controller';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { GlobalStats } from '../models/estadistiques.model';
import { fakeAsync, tick } from '@angular/core/testing';

describe('EstadistiquesComponent', () => {
    let component: EstadistiquesComponent;
    let fixture: ComponentFixture<EstadistiquesComponent>;
    let mockGameService: jasmine.SpyObj<GameService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let controller: EstadistiquesController;

    const mockGlobalStats: GlobalStats[] = [
        { 
            username: 'Player2', 
            punts_totals: 3200,
            millor_puntuacio: 600,
            total_partides: 15,
            temps_total_jugat: 4800
        },
        { 
            username: 'Player1', 
            punts_totals: 2500,
            millor_puntuacio: 500,
            total_partides: 10,
            temps_total_jugat: 3600
        }
    ];

    beforeEach(async () => {
        mockGameService = jasmine.createSpyObj('GameService', ['getGlobalStats']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockGameService.getGlobalStats.and.returnValue(of(mockGlobalStats));

        await TestBed.configureTestingModule({
            imports: [EstadistiquesComponent, HttpClientTestingModule],
            providers: [
                EstadistiquesController,
                { provide: GameService, useValue: mockGameService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(EstadistiquesComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(EstadistiquesController);
        controller.loadGlobalStats();
        fixture.detectChanges();
    });

    it('should create with controller', () => {
        expect(component).toBeTruthy();
        expect(controller).toBeTruthy();
    });

    it('should load global statistics on init', fakeAsync(() => {
        tick();
        fixture.detectChanges();
        expect(mockGameService.getGlobalStats).toHaveBeenCalled();
        expect(controller.getModel().globalStats).toEqual(mockGlobalStats);
    }));

    it('should display player statistics in order', fakeAsync(() => {
        tick();
        fixture.detectChanges();

        const rows = fixture.debugElement.queryAll(By.css('.stats-row'));
        const firstRowCells = rows[0].queryAll(By.css('.stats-cell'));
        expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('Player2');
        expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('3,200');
    }));

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

    it('should show loading state', fakeAsync(() => {
        component.model.startLoading();
        fixture.detectChanges();
        tick();

        const loadingElement = fixture.debugElement.query(By.css('.loading-error'));
        expect(loadingElement).toBeTruthy();
        expect(loadingElement.nativeElement.textContent).toContain('Carregant estadístiques');
    }));

    it('should show error state', fakeAsync(() => {
        component.model.handleError();
        fixture.detectChanges();
        tick();

        const errorElement = fixture.debugElement.query(By.css('.loading-error'));
        expect(errorElement).toBeTruthy();
        expect(errorElement.nativeElement.textContent).toContain('Error carregant les estadístiques');
    }));

    it('should show message when no statistics are available', fakeAsync(() => {
        component.model.setGlobalStats([]);
        fixture.detectChanges();
        tick();

        const noStatsElement = fixture.debugElement.query(By.css('.stats-content'));
        expect(noStatsElement).toBeTruthy();
        expect(noStatsElement.nativeElement.textContent.trim()).toContain('No hi ha estadístiques disponibles');
    }));

    it('should display all player statistics fields correctly', fakeAsync(() => {
        tick();
        fixture.detectChanges();

        const rows = fixture.debugElement.queryAll(By.css('.stats-row'));
        const firstRowCells = rows[0].queryAll(By.css('.stats-cell'));
        
        expect(firstRowCells[1].nativeElement.textContent.trim()).toBe('Player2');
        expect(firstRowCells[2].nativeElement.textContent.trim()).toBe('3,200');
        expect(firstRowCells[3].nativeElement.textContent.trim()).toBe('600');
        expect(firstRowCells[4].nativeElement.textContent.trim()).toBe('15');
        expect(firstRowCells[5].nativeElement.textContent.trim()).toBe('1h 20m 0s');
    }));

    it('should format time correctly', () => {
        expect(controller.formatTime(3665)).toBe('1h 1m 5s');
        expect(controller.formatTime(65)).toBe('1m 5s');
        expect(controller.formatTime(30)).toBe('30s');
    });
}); 