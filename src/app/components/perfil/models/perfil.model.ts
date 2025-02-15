import { Usuari } from '../../../models/usuari.model';

export class PerfilModel {
    private _userData: Usuari | null = null;
    private _editedUserData: Usuari | null = null;
    private _isEditing: boolean = false;
    private _loading: boolean = false;
    private _error: string | null = null;

    constructor() {}

    // Getters
    get userData(): Usuari | null {
        return this._userData;
    }

    get editedUserData(): Usuari | null {
        return this._editedUserData;
    }

    get isEditing(): boolean {
        return this._isEditing;
    }

    get loading(): boolean {
        return this._loading;
    }

    get error(): string | null {
        return this._error;
    }

    // Setters y métodos
    setUserData(userData: Usuari): void {
        this._userData = userData;
        this._editedUserData = Object.assign(new Usuari(), userData);
    }

    startEditing(): void {
        this._isEditing = true;
    }

    cancelEditing(): void {
        this._isEditing = false;
        this._editedUserData = Object.assign(new Usuari(), this._userData!);
    }

    updateEditedData(data: Partial<Usuari>): void {
        if (this._editedUserData) {
            this._editedUserData = Object.assign(new Usuari(), this._editedUserData, data);
        }
    }

    setLoading(loading: boolean): void {
        this._loading = loading;
    }

    setError(error: string | null): void {
        this._error = error;
    }

    hasUnsavedChanges(): boolean {
        if (!this._userData || !this._editedUserData) return false;
        return JSON.stringify(this._userData) !== JSON.stringify(this._editedUserData);
    }

    saveChanges(updatedData: Usuari): void {
        this._userData = updatedData;
        this._editedUserData = Object.assign(new Usuari(), updatedData);
        this._isEditing = false;
    }
}