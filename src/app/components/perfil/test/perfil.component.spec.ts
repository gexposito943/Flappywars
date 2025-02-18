import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from '../perfil.component';
import { RegistreService } from '../../../services/registre.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Usuari } from '../../../models/usuari.model';
import { Nivell } from '../../../models/nivell.model';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let mockRegistreService: jasmine.SpyObj<RegistreService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const baseUser = new Usuari(
    '1',
    'TestUser',
    'test@test.com',
    new Nivell('1', 'Nivell 1', 'test.jpg', 0),
    100,
    new Date('2024-01-01'),
    new Date('2024-05-01'),
    'actiu',
    0,
    null
  );

  const mockUserData = {
    id: '1',
    nom_usuari: 'TestUser',
    email: 'test@test.com',
    nivell: new Nivell('1', 'Nivell 1', 'test.jpg', 0),
    punts_totals: 100,
    data_registre: new Date('2024-01-01'),
    ultim_acces: new Date('2024-05-01T12:00:00Z'),
    estat: 'actiu',
    intents_login: 0,
    nau_actual: null,
    canviarContrasenya: false,
    idioma: 'catala' as 'catala' | 'castella'
  };

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
    await fixture.whenStable();
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
    expect(component.model.userData?.nom_usuari).toBe('TestUser');
    expect(component.model.userData?.email).toBe('test@test.com');
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
    fixture.detectChanges();
    
    const cancelButton = fixture.debugElement.query(By.css('.btn-cancel'));
    cancelButton.nativeElement.click();
    
    expect(component.model.isEditing).toBeFalse();
  });

  it('should show password input when editing', () => {
    component.model.startEditing();
    fixture.detectChanges();
    
    const passwordInput = fixture.debugElement.query(By.css('input[name="contrasenya"]'));
    expect(passwordInput).toBeTruthy();
  });

  it('should show language options when editing', () => {
    component.model.startEditing();
    fixture.detectChanges();
    
    const catalaRadio = fixture.debugElement.query(By.css('input[value="catala"]'));
    const castellaRadio = fixture.debugElement.query(By.css('input[value="castella"]'));
    
    expect(catalaRadio).toBeTruthy();
    expect(castellaRadio).toBeTruthy();
  });

  it('should show change password checkbox when editing', () => {
    component.model.startEditing();
    fixture.detectChanges();
    
    const checkbox = fixture.debugElement.query(By.css('input[name="canviarContrasenya"]'));
    expect(checkbox).toBeTruthy();
  });

  it('should update profile with new data', () => {
    component.model.startEditing();
    fixture.detectChanges();
    
    const usernameInput = fixture.debugElement.query(By.css('input[name="nom_usuari"]'));
    usernameInput.nativeElement.value = 'NewName';
    usernameInput.nativeElement.dispatchEvent(new Event('input'));
    
    fixture.detectChanges();
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    
    expect(mockRegistreService.updateUserProfile).toHaveBeenCalled();
  });

  it('should include password in update if change password is checked', () => {
    component.model.startEditing();
    fixture.detectChanges();
    
    const checkbox = fixture.debugElement.query(By.css('input[name="canviarContrasenya"]'));
    checkbox.nativeElement.click();
    fixture.detectChanges();
    
    const passwordInput = fixture.debugElement.query(By.css('input[name="contrasenya"]'));
    passwordInput.nativeElement.value = 'newPassword';
    passwordInput.nativeElement.dispatchEvent(new Event('input'));
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    
    expect(mockRegistreService.updateUserProfile).toHaveBeenCalledWith(
      '1', 
      jasmine.objectContaining({ contrasenya: 'newPassword' })
    );
  });

  it('should show error message when update fails', fakeAsync(() => {
    mockRegistreService.updateUserProfile.and.returnValue(throwError(() => new Error('Update failed')));
    component.model.startEditing();
    fixture.detectChanges();
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    tick();
    fixture.detectChanges();
    
    expect(component.model.error).toBeTruthy();
  }));

  it('should not include password in update if change password is not checked', fakeAsync(() => {
    component.model.startEditing();
    component.model.canviarContrasenya = false;
    fixture.detectChanges();
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    tick();
    
    expect(mockRegistreService.updateUserProfile.calls.mostRecent().args[1].contrasenya).toBeUndefined();
  }));

  it('should format registration date correctly', fakeAsync(() => {
    const mockUserWithDate = {
        ...mockUserData,
        data_registre: new Date('2024-01-01T00:00:00.000Z')
    };
    
    mockRegistreService.getUserData.and.returnValue(mockUserWithDate);
    
    component.ngOnInit();
    tick();
    fixture.detectChanges();
    
    const dateInput = fixture.debugElement.query(
        By.css('[data-testid="registration-date-input"]')
    );
    expect(dateInput.nativeElement.value).toBe('01/01/2024');
  }));
});
