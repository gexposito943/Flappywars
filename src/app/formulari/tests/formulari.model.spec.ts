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
});
