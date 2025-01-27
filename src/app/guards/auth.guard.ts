import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { RegistreService } from '../services/registre.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private registreService: RegistreService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true;
    }

    const token = this.registreService.getToken();
    console.log('Token actual:', token); // Debug

    const isLoggedIn = this.registreService.isLoggedIn();
    console.log('AuthGuard check - isLoggedIn:', isLoggedIn);

    if (!isLoggedIn || !token || token === 'undefined' || token === 'null') {
      console.log('Token inválido o expirado, redirigiendo al login');
      this.registreService.logout();
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}