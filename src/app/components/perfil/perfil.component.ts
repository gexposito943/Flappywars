import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistreService } from '../../services/registre.service';
import { PerfilModel } from './models/perfil.model';
import { Usuari } from '../../models/usuari.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  model = new PerfilModel();

  constructor(
    private registreService: RegistreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = this.registreService.getUserData();
    if (!userData) {
      this.router.navigate(['/']);
      return;
    }
    this.model.setUserData(new Usuari(
      userData.id,
      userData.nom_usuari,
      userData.email,
      userData.nivell,
      userData.punts_totals,
      new Date(userData.data_registre),
      userData.ultim_acces ? new Date(userData.ultim_acces) : null,
      userData.estat,
      userData.intents_login,
      userData.nau_actual
    ));
  }

  onEdit(): void {
    this.model.startEditing();
  }

  onSave(): void {
    if (!this.model.userData?.id || !this.model.editedUserData) return;
    this.model.setError(null);
    this.model.setSuccess(null);

    if (this.model.editedUserData.contrasenya && !this.model.editedUserData.canviarContrasenya) {
        this.model.setError('Has d\'activar la casella "Vull canviar la contrasenya" per canviar-la');
        return;
    }

    const updateData: any = {
        nom_usuari: this.model.editedUserData.nom_usuari,
        email: this.model.editedUserData.email
    };

    if (this.model.editedUserData.canviarContrasenya && this.model.editedUserData.contrasenya) {
        updateData.contrasenya = this.model.editedUserData.contrasenya;
    }

    this.model.setLoading(true);
    this.registreService.updateUserProfile(
        this.model.userData.id,
        updateData
    ).subscribe({
        next: (response) => {
            if (response.success && response.user) {
                this.registreService.setUserData(response.user);
                this.model.saveChanges(response.user);
                this.model.setSuccess('Perfil actualitzat correctament');
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 2000);
            }
        },
        error: (error) => {
            console.error('Error actualitzant el perfil:', error);
            this.model.setError('Error actualitzant el perfil');
        },
        complete: () => {
            this.model.setLoading(false);
        }
    });
  }

  onCancel(): void {
    this.model.cancelEditing();
  }

  onBack(): void {
    const currentUserData = this.registreService.getUserData();
    if (currentUserData) {
        this.router.navigate(['/dashboard']);
    }
  }
}
