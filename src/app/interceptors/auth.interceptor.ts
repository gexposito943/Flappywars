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
    // Asegurarse de que el token está limpio (sin espacios extras)
    const cleanToken = token.trim();
    console.log('Token a enviar:', cleanToken);

    req = req.clone({
      setHeaders: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Debug del header completo
    console.log('Header de autorización:', req.headers.get('Authorization'));
  }

  return next(req).pipe(
    catchError(error => {
      console.log('Error interceptado:', {
        status: error.status,
        message: error.message,
        error: error
      });

      if (error.status === 403) {
        // Solo hacer logout si el token está expirado o es inválido
        const response = error.error;
        console.log('Respuesta del servidor:', response);

        if (response?.message?.includes('expired') || 
            response?.message?.includes('invalid')) {
          console.log('Token expirado o inválido, haciendo logout');
          registreService.logout();
          router.navigate(['/']);
        } else {
          console.log('Error 403 pero no relacionado con el token');
        }
      }

      if (error.status === 403 && error.error?.details === 'jwt malformed') {
        console.log('Token malformado detectado, haciendo logout');
        registreService.logout();
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
}; 