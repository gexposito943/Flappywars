import { Usuari } from '../../../models/usuari.model';

export class PerfilModel {
    private _userData: Usuari | null = null;
    private _editedUserData: {
        nom_usuari: string;
        email: string;
        contrasenya?: string;
        canviarContrasenya: boolean;
        idioma: 'catala' | 'castella';
        estat: 'actiu' | 'inactiu';
    } | null = null;
    private _isEditing: boolean = false;
    private _loading: boolean = false;
    private _error: string | null = null;
    private _success: string | null = null;
    canviarContrasenya: boolean = false;

    // Getters
    get userData(): Usuari | null {
        return this._userData;
    }

    get editedUserData() {
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

    get success(): string | null {
        return this._success;
    }

    // Métodos
    setUserData(userData: Usuari): void {
        this._userData = userData;
        this._editedUserData = {
            nom_usuari: userData.nom_usuari,
            email: userData.email,
            canviarContrasenya: false,
            idioma: 'catala',
            estat: 'actiu'
        };
    }

    startEditing(): void {
        this._isEditing = true;
    }

    cancelEditing(): void {
        this._isEditing = false;
        if (this._userData) {
            this._editedUserData = {
                nom_usuari: this._userData.nom_usuari,
                email: this._userData.email,
                canviarContrasenya: false,
                idioma: 'catala',
                estat: 'actiu'
            };
        }
    }

    setLoading(loading: boolean): void {
        this._loading = loading;
    }

    setError(error: string | null): void {
        this._error = error;
    }

    getUpdatedData() {
        if (!this._editedUserData) return null;
        
        const updateData: any = {
            nom_usuari: this._editedUserData.nom_usuari,
            email: this._editedUserData.email,
            idioma: this._editedUserData.idioma
        };

        if (this._editedUserData.canviarContrasenya && this._editedUserData.contrasenya) {
            updateData.contrasenya = this._editedUserData.contrasenya;
        }

        return updateData;
    }

    saveChanges(updatedData: {
        nom_usuari: string;
        email: string;
        contrasenya?: string;
        idioma: 'catala' | 'castella';
    }): void {
        if (this._userData) {
            this._userData.nom_usuari = updatedData.nom_usuari;
            this._userData.email = updatedData.email;
            this._editedUserData = {
                ...updatedData,
                estat: 'actiu',
                canviarContrasenya: false
            };
        }
        this._isEditing = false;
    }

    updateEditedData(data: Partial<{
        nom_usuari: string;
        email: string;
        contrasenya?: string;
        canviarContrasenya: boolean;
        idioma: 'catala' | 'castella';
    }>): void {
        if (this._editedUserData) {
            this._editedUserData = { ...this._editedUserData, ...data };
        }
    }

    setSuccess(success: string | null): void {
        this._success = success;
        if (success) {
            setTimeout(() => {
                this._success = null;
            }, 3000);
        }
    }
}