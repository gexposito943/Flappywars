import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistreService } from '../../services/registre.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  constructor(
    private registreService: RegistreService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userData = this.registreService.getUserData();
    if (!userData) {
      this.router.navigate(['/']);
    }
  }
}
