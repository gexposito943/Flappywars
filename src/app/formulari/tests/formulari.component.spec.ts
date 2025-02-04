import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FormulariComponent } from '../formulari.component';
import { FormulariController } from '../controllers/formulari.controller';
import { RegistreService } from '../../services/registre.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';

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
        mockRegistreService = jasmine.createSpyObj('RegistreService', [
            'register',
            'validateUser',
            'setToken'
        ]);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        await TestBed.configureTestingModule({
            imports: [FormsModule, FormulariComponent],
            providers: [
                FormulariController,
                { provide: RegistreService, useValue: mockRegistreService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FormulariComponent);
        component = fixture.componentInstance;
        controller = TestBed.inject(FormulariController);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(controller).toBeTruthy();
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
            const input = fixture.debugElement.query(By.css('#signup-password'));
            input.nativeElement.value = 'short';
            input.nativeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent)
                .toContain('La contrasenya ha de tenir mínim 6 caràcters i un símbol especial');
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
        it('should call controller onSubmit when form is submitted', () => {
            spyOn(controller, 'onSubmit');
            const form = fixture.debugElement.query(By.css('.sign-up-form'));
            form.triggerEventHandler('submit', null);
            expect(controller.onSubmit).toHaveBeenCalled();
        });

        it('should call controller handleSignIn when sign in button is clicked', () => {
            spyOn(controller, 'handleSignIn');
            const button = fixture.debugElement.query(By.css('#sign-in-btn'));
            button.nativeElement.click();
            expect(controller.handleSignIn).toHaveBeenCalled();
        });
    });

    describe('Panel Animations', () => {
        it('should toggle sign-up-mode class on container', () => {
            const signUpBtn = fixture.debugElement.query(By.css('#sign-up-btn'));
            const signInBtn = fixture.debugElement.query(By.css('#sign-in-btn'));
            const container = fixture.debugElement.query(By.css('.container'));

            signUpBtn.nativeElement.click();
            expect(container.nativeElement.classList.contains('sign-up-mode')).toBeTrue();

            signInBtn.nativeElement.click();
            expect(container.nativeElement.classList.contains('sign-up-mode')).toBeFalse();
        });
    });
});
