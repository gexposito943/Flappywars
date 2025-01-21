import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values game canvas', () => {
    expect(component.score).toBe(0);
    expect(component.isGameRunning).toBeFalse();
    expect(component.canvasWidth).toBe(800);
    expect(component.canvasHeight).toBe(600);
  });
  it('should have a canvas element', () => {
    const canvasElement = fixture.nativeElement.querySelector('canvas');
    expect(canvasElement).toBeTruthy();
    expect(canvasElement.width).toBe(component.canvasWidth);
    expect(canvasElement.height).toBe(component.canvasHeight);
  });
});
