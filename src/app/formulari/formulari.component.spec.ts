import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormulariComponent } from './formulari.component';


describe('FormulariComponent', () => {
  let component: FormulariComponent;
  let fixture: ComponentFixture<FormulariComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        ReactiveFormsModule, 
        HttpClientModule,
        FormulariComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(component, 'handleSignIn');
  });

  const testErrorField = (fieldName: string, value: string = '') => {
    const control = component.registerForm.get(fieldName);
    control?.setValue(value);
    control?.markAsTouched();
    fixture.detectChanges();
    return control?.errors && control.touched;
  };

  it('should validate username', () => {
    expect(component.username).toBeDefined(); 
    component.username = 'testUser'; 
    expect(component.username).toBe('testUser'); 
    component.username = ''; 
    expect(component.username).toBe(''); 
  });

  it('should validate email', () => {
    expect(component.email).toBeDefined(); 
    component.email = 'test@example.com'; 
    expect(component.email).toBe('test@example.com'); 
    component.email = ''; 
    expect(component.email).toBe(''); 
  });

  it('should validate password', () => {
    expect(component.password).toBeDefined(); 
    component.password = 'Test@123'; 
    expect(component.password).toBe('Test@123'); 
    const isValid = component.password.length >= 6 && /[A-Z]/.test(component.password) && /[!@#$%^&*(),.?":{}|<>]/.test(component.password);
    expect(isValid).toBeTrue(); 
    component.password = ''; 
    expect(component.password).toBe(''); 
  });

  it('should validate confirm password', () => {
    component.password = 'Test@123';
    component.confirmPassword = 'Test@123';
    expect(component.confirmPassword).toBe(component.password); 
  });

  it('should show error if username is empty', () => {
    expect(testErrorField('username')).toBeTrue();
  });

  it('should show error if email is empty', () => {
    expect(testErrorField('email')).toBeTrue();
  });

  it('should show error if password is empty', () => {
    expect(testErrorField('password')).toBeTrue();
  });

  it('should show error if confirm password is empty', () => {
    expect(testErrorField('confirmPassword')).toBeTrue();
  });

  it('should show error if password is incorrect during login', () => {
    component.registerForm.get('password')?.setValue('123');
    component.registerForm.get('password')?.markAsTouched();
    fixture.detectChanges();
    expect(component.registerForm.get('password')?.errors).toBeTruthy();
  });

  it('should show error if passwords do not match', () => {
    component.registerForm.patchValue({
      password: '123456',
      confirmPassword: '123457'
    });
    component.registerForm.get('confirmPassword')?.markAsTouched();
    fixture.detectChanges();
    expect(component.registerForm.hasError('passwordMismatch')).toBeTrue();
  });

  it('should trigger sign-in button click', () => {
    const signInButton = fixture.nativeElement.querySelector('#sign-in-btn');
    signInButton.click();
    expect(component.handleSignIn).toHaveBeenCalled(); 
  });
});
