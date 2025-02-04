import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RegistreService } from '../../services/registre.service';
import { FormulariModel } from '../models/formulari.model';
import { BaseController } from '../core/base.controller';

/**
 * Controlador que gestiona la lògica del formulari
 * Gestiona el registre i l'autenticació d'usuaris
 */
@Injectable()
export class FormulariController extends BaseController<FormulariModel> {
    constructor(
        private registreService: RegistreService,
        private router: Router
    ) {
        super(new FormulariModel());
    }

    onSubmit(): void {
        if (this.validateForm()) {
            this.registreService.register(
                this.model.username,
                this.model.email,
                this.model.password
            ).subscribe({
                next: () => {
                    alert('Registre completat amb èxit! Ara pots iniciar sessió.');
                    this.model.clearInputs();
                },
                error: (error) => {
                    console.error('Error en el registre:', error);
                    if (error.error?.error) {
                        alert(error.error.error);
                    } else {
                        alert('Error en el registre');
                    }
                }
            });
        }
    }

    handleSignIn(): void {
        if (this.validateLogin()) {
            this.registreService.validateUser(
                this.model.email,
                this.model.password
            ).subscribe({
                next: (response) => {
                    if (response?.token) {
                        this.registreService.setToken(response.token);
                        if (response.user) {
                            localStorage.setItem('userData', JSON.stringify(response.user));
                        }
                        this.router.navigate(['/dashboard']);
                    }
                },
                error: (error) => {
                    console.error('Error al verificar l\'usuari:', error);
                    if (error.status === 401) {
                        alert('Contrasenya incorrecta');
                    } else if (error.status === 404) {
                        alert('Usuari no trobat');
                    } else {
                        alert('Error en iniciar sessió');
                    }
                }
            });
        }
    }

    private validateForm(): boolean {
        return !this.model.errors.username &&
               !this.model.errors.email &&
               !this.model.errors.password &&
               !this.model.errors.confirmPassword;
    }

    private validateLogin(): boolean {
        return this.model.email.length > 0 && 
               this.model.password.length > 0;
    }
} 