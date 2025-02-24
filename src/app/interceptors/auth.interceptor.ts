import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { RegistreService } from '../services/registre.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const registreService = inject(RegistreService);
  const router = inject(Router);

  const token = registreService.getToken();
  
  if (token) {
    // Assegurar-se que el token està net i és vàlid
    const cleanToken = token.trim();
    
    if (!cleanToken || cleanToken === 'undefined' || cleanToken === 'null') {
      console.log('Token invàlid detectat');
      registreService.logout();
      router.navigate(['/']);
      return throwError(() => new Error('Token invàlid'));
    }

    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Token enviat:', cleanToken);
  }

  return next(req).pipe(
    catchError(error => {
      console.log('Error interceptado:', {
        status: error.status,
        message: error.message,
        error: error
      });

      if (error.status === 403) {
        // nomes fer logout si el token està expirat o és invàlid
        const response = error.error;
        console.log('Resposta del servidor:', response);

        if (response?.message?.includes('expired') || 
            response?.message?.includes('invalid')) {
          console.log('Token expirat o invàlid, fent logout');
          registreService.logout();
          router.navigate(['/']);
        } else {
          console.log('Error 403 però no relacionat amb el token');
        }
      }

      if (error.status === 403 && error.error?.details === 'jwt malformed') {
        console.log('Token malformat detectat, fent logout');
        registreService.logout();
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
}; 