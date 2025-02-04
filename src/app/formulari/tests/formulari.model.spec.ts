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
});
