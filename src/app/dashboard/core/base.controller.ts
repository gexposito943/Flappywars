import { BaseModel } from '../models/base.model';

interface ModelWithError {
    setError(error: string | null): void;
}

export interface Action {
    type: string;
    payload?: any;
}

export abstract class BaseController<T extends BaseModel & ModelWithError> {
    protected model: T;

    constructor(model: T) {
        this.model = model;
    }

    abstract initialize(): void;
    
    abstract dispatch(action: Action): void;

    getModel(): T {
        return this.model;
    }

    protected handleError(error: Error): void {
        console.error('Controller Error:', error);
        this.model.setError(error.message);
    }

    protected clearError(): void {
        this.model.setError(null);
    }
}