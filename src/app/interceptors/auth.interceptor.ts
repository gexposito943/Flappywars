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

      // Si el error es 401 o 403, intentar refrescar el token
      if (error.status === 401 || error.status === 403) {
        const errorMsg = error.error?.message || '';
        
        if (errorMsg.includes('expired') || errorMsg.includes('invalid') || 
            errorMsg.includes('jwt')) {
          console.log('Token expirado o inválido, intentando refrescar...');
          
          // Intentar refrescar el token
          registreService.refreshToken().subscribe({
            next: () => {
              console.log('Token refrescado con éxito');
            },
            error: (refreshError) => {
              console.error('Error al refrescar token:', refreshError);
              registreService.logout();
              router.navigate(['/']);
            }
          });
        }
      }
      
      return throwError(() => error);
    })
  );
}; 