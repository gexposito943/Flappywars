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

    this.model.setLoading(true);
    this.registreService.updateUserProfile(
      this.model.userData.id,
      {
        nom_usuari: this.model.editedUserData.nom_usuari,
        email: this.model.editedUserData.email
      }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.model.saveChanges(this.model.editedUserData!);
          this.registreService.setUserData(this.model.userData);
          alert('Perfil actualitzat correctament');
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
    this.router.navigate(['/dashboard']);
  }
}
