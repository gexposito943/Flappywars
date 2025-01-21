import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RegistreService } from '../services/registre.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private registreService: RegistreService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.registreService.isLoggedIn()) {
      return true;
    }

    this.router.navigate(['']);
    return false;
  }
}