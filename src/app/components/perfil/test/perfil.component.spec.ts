import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from '../perfil.component';
import { RegistreService } from '../../../services/registre.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Usuari } from '../../../models/usuari.model';
import { Nivell } from '../../../models/nivell.model';
import { of } from 'rxjs';

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
    ...baseUser,
    data_registre: '2024-01-01',
    ultim_acces: '2024-05-01T12:00:00Z',
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

    mockRegistreService.getUserData.and.returnValue({
      ...mockUserData,
      data_registre: new Date(mockUserData.data_registre),
      ultim_acces: new Date(mockUserData.ultim_acces)
    });

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
    expect(component.model.userData?.data_registre).toEqual(new Date('2024-01-01'));
    expect(component.model.userData?.ultim_acces).toEqual(new Date('2024-05-01T12:00:00Z'));
    expect(component.model.editedUserData).toEqual({
        nom_usuari: baseUser.nom_usuari,
        email: baseUser.email,
        canviarContrasenya: false,
        idioma: 'catala'
    });
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
    
    expect(component.model.editedUserData).toEqual({
        nom_usuari: baseUser.nom_usuari,
        email: baseUser.email,
        canviarContrasenya: false,
        idioma: 'catala'
    });
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
    const updatedData = {
      nom_usuari: 'NewName',
      email: 'new@email.com',
      idioma: 'castella' as 'catala' | 'castella'
    };

    mockRegistreService.updateUserProfile.and.returnValue(of({ success: true, message: 'Updated' }));
    
    component.model.startEditing();
    component.model.updateEditedData(updatedData);
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    
    expect(mockRegistreService.updateUserProfile).toHaveBeenCalledWith(
      baseUser.id,
      jasmine.objectContaining(updatedData)
    );
  });

  it('should include password in update if change password is checked', () => {
    const updatedData = {
      nom_usuari: 'TestUser',
      email: 'test@test.com',
      contrasenya: 'newPassword',
      canviarContrasenya: true,
      idioma: 'catala' as 'catala' | 'castella'
    };

    mockRegistreService.updateUserProfile.and.returnValue(of({ success: true, message: 'Updated' }));
    
    component.model.startEditing();
    component.model.updateEditedData(updatedData);
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    
    expect(mockRegistreService.updateUserProfile).toHaveBeenCalledWith(
      baseUser.id,
      jasmine.objectContaining({ contrasenya: 'newPassword' })
    );
  });

  it('should not include password in update if change password is not checked', () => {
    const updatedData = {
      nom_usuari: 'TestUser',
      email: 'test@test.com',
      contrasenya: 'newPassword',
      canviarContrasenya: false,
      idioma: 'catala' as 'catala' | 'castella'
    };

    mockRegistreService.updateUserProfile.and.returnValue(of({ success: true, message: 'Updated' }));
    
    component.model.startEditing();
    component.model.updateEditedData(updatedData);
    
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    
    expect(mockRegistreService.updateUserProfile).toHaveBeenCalledWith(
      baseUser.id,
      jasmine.objectContaining({
        nom_usuari: 'TestUser',
        email: 'test@test.com',
        idioma: 'catala'
      })
    );
  });

  it('should show error message when update fails', () => {
    mockRegistreService.updateUserProfile.and.returnValue(of({ success: false, message: 'Error' }));
    
    component.model.startEditing();
    const saveButton = fixture.debugElement.query(By.css('.btn-save'));
    saveButton.nativeElement.click();
    
    fixture.detectChanges();
    
    const errorMessage = fixture.debugElement.query(By.css('.error-message'));
    expect(errorMessage).toBeTruthy();
  });

  it('should format registration date correctly', () => {
    fixture.detectChanges();
    const dateInput = fixture.debugElement.query(By.css('input[placeholder="Data de registre"]'));
    expect(dateInput.nativeElement.value).toBe('01/01/2024');
  });
});
