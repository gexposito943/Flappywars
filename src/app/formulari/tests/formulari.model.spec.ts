import { FormulariModel } from '../models/formulari.model';

describe('FormulariModel', () => {
    let model: FormulariModel;

    beforeEach(() => {
        model = new FormulariModel();
    });

    describe('Username validation', () => {
        it('should get and set username', () => {
            expect(model.username).toBe('');
            
            model.setUsername('testUser');
            expect(model.username).toBe('testUser');
            
            model.setUsername('');
            expect(model.username).toBe('');
        });

        it('should validate username requirements', () => {
            model.setUsername('');
            expect(model.errors.username).toBeTrue();
            
            model.setUsername('validUser');
            expect(model.errors.username).toBeFalse();
        });
    });

    describe('Email validation', () => {
        it('should get and set email', () => {
            expect(model.email).toBe('');
            
            model.setEmail('test@example.com');
            expect(model.email).toBe('test@example.com');
            
            model.setEmail('');
            expect(model.email).toBe('');
        });

        it('should validate email format', () => {
            model.setEmail('');
            expect(model.errors.email).toBeTrue();
            
            model.setEmail('invalid-email');
            expect(model.errors.email).toBeTrue();
            
            model.setEmail('test@example.com');
            expect(model.errors.email).toBeFalse();
        });
    });

    describe('Password validation', () => {
        it('should get and set password', () => {
            expect(model.password).toBe('');
            model.setPassword('Test@123');
            expect(model.password).toBe('Test@123');
            model.setPassword('');
            expect(model.password).toBe('');
        });

        it('should validate password requirements', () => {
            model.setPassword('');
            expect(model.errors.password).toBeTrue();
            
            model.setPassword('short');
            expect(model.errors.password).toBeTrue();
            
            model.setPassword('longbutnosymbol123');
            expect(model.errors.password).toBeTrue();
            
            model.setPassword('Valid@Password123');
            expect(model.errors.password).toBeFalse();
        });

        it('should validate password confirmation', () => {
            model.setPassword('Valid@Password123');
            model.setConfirmPassword('Valid@Password123');
            expect(model.errors.confirmPassword).toBeFalse();

            model.setConfirmPassword('DifferentPassword@123');
            expect(model.errors.confirmPassword).toBeTrue();
        });
    });
});
