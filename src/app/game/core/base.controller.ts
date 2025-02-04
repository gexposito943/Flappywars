/**
 * Controlador base que proporciona funcionalitat bàsica per a tots els controladors
 * Gestiona l'accés al model mitjançant getters i setters genèrics
 */
export abstract class BaseController<T> {
    protected model: T;

    constructor(model: T) {
        this.model = model;
    }

    getModel(): T {
        return this.model;
    }

    setModel(model: T): void {
        this.model = model;
    }

    dispatch(action: { type: string, payload?: any }): void {
        // Implementación base que puede ser sobrescrita
        console.log('Action dispatched:', action);
    }
} 