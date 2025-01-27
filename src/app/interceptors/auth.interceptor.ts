import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { RegistreService } from '../services/registre.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const registreService = inject(RegistreService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 403) {
        registreService.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
}; 