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
        mockRegistreService = jasmine.createSpyObj('RegistreService', ['register', 'validateUser', 'setToken', 'logout']);
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
                rol: 'user',
                nau: {
                    id: '123e4567-e89b-12d3-a456-426614174001',
                    nom: 'X-Wing',
                    imatge_url: '/assets/images/naus/x-wing.png',

                }
            }
        }));
        mockRegistreService.register.and.returnValue(of({ success: true }));
        mockRegistreService.logout.and.returnValue();

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
        expect(mockRegistreService.logout).toHaveBeenCalled();
    });

    describe('Form Validation', () => {
        beforeEach(() => {
            component.showRegisterErrors = true;
            fixture.detectChanges();
        });

        it('should show username error when empty', () => {
            component.registerUser.username = '';
            fixture.detectChanges();
            
            const errors = fixture.debugElement.queryAll(By.css('.error-message'));
            expect(errors[0].nativeElement.textContent).toContain('El nom d\'usuari és obligatori');
        });

        it('should show email error when invalid', () => {
            component.registerUser.email = '';
            fixture.detectChanges();

            const errors = fixture.debugElement.queryAll(By.css('.error-message'));
            const emailError = errors.find(error => 
                error.nativeElement.textContent.includes('L\'email és obligatori'));
            expect(emailError?.nativeElement.textContent.trim())
                .toBe('L\'email és obligatori i ha de ser vàlid');
        });

        it('should show password error when requirements not met', () => {
            component.registerUser.password = 'short';
            fixture.detectChanges();

            const errors = fixture.debugElement.queryAll(By.css('.error-message'));
            expect(errors[2].nativeElement.textContent)
                .toContain('La contrasenya ha de tenir mínim 6 caràcters i un símbol especial');
        });

        it('should show password mismatch error', () => {
            component.registerUser.password = 'Valid@Password123';
            component.registerUser.confirmPassword = 'DifferentPassword@123';
            component.showRegisterErrors = true;
            fixture.detectChanges();

            const errors = fixture.debugElement.queryAll(By.css('.error-message'));
            const mismatchError = errors.find(error => 
                error.nativeElement.textContent.includes('Les contrasenyes no coincideixen'));
            expect(mismatchError?.nativeElement.textContent.trim())
                .toBe('Les contrasenyes no coincideixen');
        });
    });

    describe('Form Submission', () => {
        it('should call register service when form is valid', fakeAsync(() => {
            component.registerUser.username = 'testuser';
            component.registerUser.email = 'test@test.com';
            component.registerUser.password = 'Valid@Pass123';
            component.registerUser.confirmPassword = 'Valid@Pass123';
            
            fixture.detectChanges();
            component.onSubmit();
            tick(2000);

            expect(mockRegistreService.register).toHaveBeenCalledWith(
                'testuser',
                'test@test.com',
                'Valid@Pass123'
            );
        }));

        it('should call validateUser service when login form is valid', fakeAsync(() => {
            const testData = {
                email: 'test@test.com',
                password: 'password123'
            };
            
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
                    rol: 'user',
                    nau: {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        nom: 'X-Wing',
                        imatge_url: '/assets/images/naus/x-wing.png'
                    }
                }
            }));
            mockRegistreService.login = jasmine.createSpy('login');

            component.loginCredentials.email = testData.email;
            component.loginCredentials.password = testData.password;

            fixture.detectChanges();
            component.handleSignIn();
            tick();

            expect(mockRegistreService.validateUser).toHaveBeenCalledWith(
                testData.email,
                testData.password
            );
            expect(mockRegistreService.login).toHaveBeenCalled();
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