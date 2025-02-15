import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from '../perfil.component';
import { RegistreService } from '../../../services/registre.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let mockRegistreService: jasmine.SpyObj<RegistreService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUserData = {
    id: '1',
    nom_usuari: 'TestUser',
    email: 'test@test.com',
    data_registre: new Date(),
    nivell: {
      id: '1',
      nom: 'Nivell 1',
      imatge_url: 'test.jpg',
      imatge: 'test.jpg'
    },
    punts_totals: 100
  };

  beforeEach(async () => {
    mockRegistreService = jasmine.createSpyObj('RegistreService', [
      'getUserData',
      'updateUserProfile',
      'updateStoredUserData'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockRegistreService.getUserData.and.returnValue(mockUserData);

    await TestBed.configureTestingModule({
      imports: [PerfilComponent, FormsModule],
      providers: [
        { provide: RegistreService, useValue: mockRegistreService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to home if no user data', () => {
    mockRegistreService.getUserData.and.returnValue(null);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should load user data on init', () => {
    expect(component.userData).toEqual(mockUserData);
    expect(component.editedUserData).toEqual(mockUserData);
  });

  it('should enable editing mode when edit button is clicked', () => {
    const editButton = fixture.debugElement.query(By.css('.btn-edit'));
    editButton.nativeElement.click();
    expect(component.isEditing).toBeTrue();
  });

  it('should disable inputs when not in editing mode', () => {
    const usernameInput = fixture.debugElement.query(By.css('input[name="nom_usuari"]'));
    const emailInput = fixture.debugElement.query(By.css('input[name="email"]'));
    
    expect(usernameInput.nativeElement.readOnly).toBeTrue();
    expect(emailInput.nativeElement.readOnly).toBeTrue();
  });

  it('should enable inputs when in editing mode', () => {
    component.isEditing = true;
    fixture.detectChanges();
    
    const usernameInput = fixture.debugElement.query(By.css('input[name="nom_usuari"]'));
    const emailInput = fixture.debugElement.query(By.css('input[name="email"]'));
    
    expect(usernameInput.nativeElement.readOnly).toBeFalse();
    expect(emailInput.nativeElement.readOnly).toBeFalse();
  });

  it('should show save and cancel buttons when in editing mode', () => {
    component.isEditing = true;
    fixture.detectChanges();
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    const cancelButton = fixture.debugElement.query(By.css('.btn-cancel'));
    
    expect(saveButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();
  });

  it('should restore original data when cancel is clicked', () => {
    component.isEditing = true;
    component.editedUserData = {
      ...mockUserData,
      nom_usuari: 'ChangedName'
    };
    
    const cancelButton = fixture.debugElement.query(By.css('.btn-cancel'));
    cancelButton.nativeElement.click();
    
    expect(component.editedUserData).toEqual(mockUserData);
    expect(component.isEditing).toBeFalse();
  });
});
