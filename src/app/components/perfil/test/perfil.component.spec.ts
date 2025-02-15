import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from '../perfil.component';
import { RegistreService } from '../../../services/registre.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Usuari } from '../../../models/usuari.model';
import { Nivell } from '../../../models/nivell.model';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let mockRegistreService: jasmine.SpyObj<RegistreService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockUserData = new Usuari(
    '1',
    'TestUser',
    'test@test.com',
    new Nivell('1', 'Nivell 1', 'test.jpg', 0),
    100,
    new Date(),
    null,
    'actiu',
    0,
    null
  );

  beforeEach(async () => {
    mockRegistreService = jasmine.createSpyObj('RegistreService', [
      'getUserData',
      'updateUserProfile',
      'setUserData'
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
    expect(component.model.userData).toEqual(mockUserData);
    expect(component.model.editedUserData).toEqual(mockUserData);
  });

  it('should enable editing mode when edit button is clicked', () => {
    const editButton = fixture.debugElement.query(By.css('.btn-edit'));
    editButton.nativeElement.click();
    expect(component.model.isEditing).toBeTrue();
  });

  it('should disable inputs when not in editing mode', () => {
    const usernameInput = fixture.debugElement.query(By.css('input[name="nom_usuari"]'));
    const emailInput = fixture.debugElement.query(By.css('input[name="email"]'));
    
    expect(usernameInput.nativeElement.readOnly).toBeTrue();
    expect(emailInput.nativeElement.readOnly).toBeTrue();
  });

  it('should enable inputs when in editing mode', () => {
    component.model.startEditing();
    fixture.detectChanges();
    
    const usernameInput = fixture.debugElement.query(By.css('input[name="nom_usuari"]'));
    const emailInput = fixture.debugElement.query(By.css('input[name="email"]'));
    
    expect(usernameInput.nativeElement.readOnly).toBeFalse();
    expect(emailInput.nativeElement.readOnly).toBeFalse();
  });

  it('should show save and cancel buttons when in editing mode', () => {
    component.model.startEditing();
    fixture.detectChanges();
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    const cancelButton = fixture.debugElement.query(By.css('.btn-cancel'));
    
    expect(saveButton).toBeTruthy();
    expect(cancelButton).toBeTruthy();
  });

  it('should restore original data when cancel is clicked', () => {
    component.model.startEditing();
    component.model.updateEditedData({
      nom_usuari: 'ChangedName'
    });
    
    const cancelButton = fixture.debugElement.query(By.css('.btn-cancel'));
    cancelButton.nativeElement.click();
    
    expect(component.model.editedUserData).toEqual(mockUserData);
    expect(component.model.isEditing).toBeFalse();
  });
});
