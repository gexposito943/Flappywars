import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormulariComponent } from '../formulari.component';
import { FormulariController } from '../controllers/formulari.controller';
import { RegistreService } from '../../services/registre.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

/**
 * Tests del component de formulari
 * Comprova la interacció amb l'usuari i la visualització d'errors
 */
describe('FormulariComponent', () => {
    let component: FormulariComponent;
    let fixture: ComponentFixture<FormulariComponent>;
    let controller: FormulariController;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['register', 'validateUser', 'setToken']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        mockRegistreService.validateUser.and.returnValue(of({
            success: true,
            token: 'test-token',
            user: {
                id: 1,
                username: 'test',
                email: 'test@test.com',
                nivel: 1,
                puntosTotales: 0,
                naveActual: 1,
                nombreNave: 'X-Wing'
            }
        }));
        mockRegistreService.register.and.returnValue(of({ success: true }));

        await TestBed.configureTestingModule({
            imports: [
                FormulariComponent,
                FormsModule, 
                ReactiveFormsModule, 
                HttpClientTestingModule
            ],
            providers: [
                FormulariController,
                { provide: RegistreService, useValue: mockRegistreService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FormulariComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(FormulariController);
        
        // Espiar los métodos del controlador después de la inyección
        spyOn(controller, 'onSubmit');
        spyOn(controller, 'handleSignIn');
        
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Validation', () => {
        it('should show username error when empty', () => {
            const input = fixture.debugElement.query(By.css('#signup-username'));
            input.nativeElement.value = '';
            input.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent).toContain('El nom d\'usuari és obligatori');
        });

        it('should show email error when invalid', () => {
            const input = fixture.debugElement.query(By.css('#signup-email'));
            input.nativeElement.value = 'invalid-email';
            input.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent).toContain('L\'email és obligatori i ha de ser vàlid');
        });

        it('should show password error when requirements not met', () => {
            const password = component.registerForm.get('password');
            password?.setValue('');
            password?.markAsTouched();
            fixture.detectChanges();
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = component.getPasswordErrorMessage();
            document.body.appendChild(errorDiv);
            
            expect(errorDiv.textContent).toContain('La contrasenya ha de tenir mínim 6 caràcters i un símbol especial');
            document.body.removeChild(errorDiv);
        });

        it('should show password mismatch error', () => {
            const passwordInput = fixture.debugElement.query(By.css('#signup-password'));
            const confirmInput = fixture.debugElement.query(By.css('#signup-confirm-password'));
            
            passwordInput.nativeElement.value = 'Valid@Password123';
            confirmInput.nativeElement.value = 'DifferentPassword@123';
            
            passwordInput.nativeElement.dispatchEvent(new Event('input'));
            confirmInput.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent).toContain('Les contrasenyes no coincideixen');
        });
    });

    describe('Form Submission', () => {
        it('should call controller onSubmit when form is valid', fakeAsync(() => {
            const formData = {
                username: 'testuser',
                email: 'test@test.com',
                password: 'Password123!'
            };

            component.registerForm.setValue(formData);
            fixture.detectChanges();

            const form = fixture.debugElement.query(By.css('form.sign-up-form'));
            form.triggerEventHandler('ngSubmit', null);
            
            tick();
            fixture.detectChanges();
            
            expect(controller.onSubmit).toHaveBeenCalled();
        }));

        it('should call controller handleSignIn when login form is valid', fakeAsync(() => {
            const loginData = {
                email: 'test@test.com',
                password: 'Password123!'
            };

            component.loginForm.setValue(loginData);
            fixture.detectChanges();

            const form = fixture.debugElement.query(By.css('form.sign-in-form'));
            form.triggerEventHandler('ngSubmit', null);
            
            tick();
            fixture.detectChanges();
            
            expect(controller.handleSignIn).toHaveBeenCalled();
        }));
    });

    describe('Panel Animations', () => {
        it('should toggle sign-up-mode class on container', () => {
            component.toggleMode();
            fixture.detectChanges();
            expect(component.isSignUpMode).toBeTrue();
        });
    });
});
