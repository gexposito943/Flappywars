import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from '../dashboard.component';
import { DashboardController } from '../controllers/dashboard.controller';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let controller: DashboardController;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [DashboardController]
        }).compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(DashboardController);
        fixture.detectChanges();
    });

    it('should create component with MVC structure', () => {
        expect(component).toBeTruthy();
        expect(component.model).toBeTruthy();
        expect(controller).toBeTruthy();
    });
}); 