import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormulariComponent } from './formulari.component';


describe('FormulariComponent', () => {
  let component: FormulariComponent;
  let fixture: ComponentFixture<FormulariComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        FormulariComponent, 
        FormsModule, 
        HttpClientModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    spyOn(component, 'handleSignIn');
  });

  function testErrorField(field: 'username' | 'email' | 'password' | 'confirmPassword', expectedError: string) {
    component[field] = ''; 
    component.onSubmit(); 
    expect(component[`${expectedError}Error` as keyof FormulariComponent]).toBeTrue(); 
  }

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

  it('should show error if password is incorrect during login', () => {
    component.password = 'incorrectPassword';
    component.onSubmit(); 
    expect(component.passwordError).toBeTrue();
  });

  it('should show error if username is empty', () => {
    testErrorField('username', 'username'); 
  });

  it('should show error if email is empty', () => {
    testErrorField('email', 'email'); 
  });

  it('should show error if password is empty', () => {
    testErrorField('password', 'password'); 
  });

  it('should show error if confirm password is empty', () => {
    testErrorField('confirmPassword', 'password'); 
  });

  it('should show error if passwords do not match', () => {
    component.password = 'Test@123';
    component.confirmPassword = 'Different@123'; 
    component.onSubmit(); 
    expect(component.confirmPasswordMismatchError).toBeTrue(); 
  });

  it('should trigger sign-in button click', () => {
    const signInButton = fixture.nativeElement.querySelector('#sign-in-btn');
    signInButton.click();
    expect(component.handleSignIn).toHaveBeenCalled(); 
  });
});
