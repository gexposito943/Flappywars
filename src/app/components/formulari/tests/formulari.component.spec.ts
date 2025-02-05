import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { FormulariComponent } from '../formulari.component';
import { RegistreService } from '../../../services/registre.service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

describe('FormulariComponent', () => {
    let component: FormulariComponent;
    let fixture: ComponentFixture<FormulariComponent>;
    let mockRegistreService: jasmine.SpyObj<RegistreService>;
    let mockRouter: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['register', 'validateUser', 'setToken']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);

        mockRegistreService.validateUser.and.returnValue(of({
            success: true,
            token: 'test-token',
            user: {
                id: '123e4567-e89b-12d3-a456-426614174000',
                nom_usuari: 'test',
                email: 'test@test.com',
                nivell: 1,
                punts_totals: 0,
                nau_actual: '123e4567-e89b-12d3-a456-426614174001',
                data_registre: '2024-01-01T00:00:00Z',
                ultim_acces: null,
                estat: 'actiu',
                intents_login: 0,
                nau: {
                    id: '123e4567-e89b-12d3-a456-426614174001',
                    nom: 'X-Wing',
                    imatge_url: '/assets/images/naus/x-wing.png'
                }
            }
        }));
        mockRegistreService.register.and.returnValue(of({ success: true }));

        await TestBed.configureTestingModule({
            imports: [
                FormulariComponent,
                FormsModule,
                HttpClientTestingModule
            ],
            providers: [
                { provide: RegistreService, useValue: mockRegistreService },
                { provide: Router, useValue: mockRouter }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(FormulariComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Validation', () => {
        it('should show username error when empty', () => {
            component.registerUser.username = '';
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent).toContain('El nom d\'usuari és obligatori');
        });

        it('should show email error when invalid', () => {
            component.registerUser.email = 'invalid-email';
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent).toContain('L\'email és obligatori i ha de ser vàlid');
        });

        it('should show password error when requirements not met', () => {
            component.registerUser.password = 'short';
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent)
                .toContain('La contrasenya ha de tenir mínim 6 caràcters i un símbol especial');
        });

        it('should show password mismatch error', () => {
            component.registerUser.password = 'Valid@Password123';
            component.registerUser.confirmPassword = 'DifferentPassword@123';
            fixture.detectChanges();

            const errorMessage = fixture.debugElement.query(By.css('.error-message'));
            expect(errorMessage.nativeElement.textContent).toContain('Les contrasenyes no coincideixen');
        });
    });

    describe('Form Submission', () => {
        it('should call register service when form is valid', fakeAsync(() => {
            const testData = {
                username: 'testuser',
                email: 'test@test.com',
                password: 'Password123!'
            };

            component.registerUser.username = testData.username;
            component.registerUser.email = testData.email;
            component.registerUser.password = testData.password;
            component.registerUser.confirmPassword = testData.password;

            fixture.detectChanges();
            expect(component.registerUser.validate().isValid).toBeTrue();

            component.onSubmit();
            
            tick();
            expect(mockRegistreService.register).toHaveBeenCalledWith(
                testData.username,
                testData.email,
                testData.password
            );
        }));

        it('should call validateUser service when login form is valid', fakeAsync(() => {
            const testData = {
                email: 'test@test.com',
                password: 'password123'
            };
            
            component.loginCredentials.email = testData.email;
            component.loginCredentials.password = testData.password;

            fixture.detectChanges();
            component.handleSignIn();
            
            tick();
            expect(mockRegistreService.validateUser).toHaveBeenCalledWith(
                testData.email,
                testData.password
            );
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