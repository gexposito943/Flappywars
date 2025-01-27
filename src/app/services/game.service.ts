import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { RegistreService } from './registre.service';

export interface UserStats {
  millor_puntuacio: number;
  total_partides: number;
  temps_total_jugat: number;
}

export interface Achievement {
  id: number;
  nom: string;
  completat: boolean;
}

export interface GameData {
  puntuacio: number;
  temps_jugat: number;
  nau_id: number;
}

export interface Ship {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = 'http://localhost:3000/api/v1';

  constructor(
    private http: HttpClient,
    private registreService: RegistreService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.registreService.getToken();
    if (!token) {
      console.warn('No token found');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);

      // Si el error es 404, devolvemos el resultado por defecto
      if (error.status === 404) {
        console.warn(`${operation}: API endpoint not found, using default values`);
        return of(result as T);
      }

      // Registramos el error para debugging
      console.error(`${operation} error details:`, {
        status: error.status,
        message: error.message,
        url: error.url
      });

      // Devolvemos un resultado seguro por defecto
      return of(result as T);
    };
  }

  getUserStats(): Observable<UserStats> {
    console.log('Obteniendo estadísticas del usuario');
    const headers = this.getHeaders();
    
    return this.http.get<{success: boolean, estadistiques: UserStats}>(`${this.apiUrl}/user/stats`, { headers }).pipe(
      tap(response => console.log('Estadísticas recibidas:', response)),
      map(response => response.estadistiques),
      catchError(error => {
        console.error('Error en getUserStats:', error);
        if (error.status === 403) {
          console.log('Token inválido, redirigiendo a login');
          this.registreService.logout();
        }
        return of({
          millor_puntuacio: 0,
          total_partides: 0,
          temps_total_jugat: 0
        });
      })
    );
  }

  getAvailableShips(): Observable<Ship[]> {
    return this.http.get<Ship[]>(
      `${this.apiUrl}/user/ships`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError<Ship[]>('getAvailableShips', []))
    );
  }

  updateUserShip(shipId: number): Observable<any> {
    console.log('Actualizando nave del usuario:', shipId);
    const headers = this.getHeaders();
    
    return this.http.post(`${this.apiUrl}/user/ship`, { shipId }, { headers }).pipe(
      tap(response => console.log('Respuesta actualización nave:', response)),
      catchError(error => {
        console.error('Error al actualizar nave:', error);
        if (error.status === 403) {
          this.registreService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  getUserAchievements(): Observable<Achievement[]> {
    console.log('Obteniendo logros del usuario');
    const headers = this.getHeaders();
    
    return this.http.get<Achievement[]>(`${this.apiUrl}/user/achievements`, { headers }).pipe(
      tap(achievements => console.log('Logros recibidos:', achievements)),
      catchError(error => {
        console.error('Error al obtener logros:', error);
        return of([]);
      })
    );
  }

  saveGameResults(gameData: GameData): Observable<{success: boolean}> {
    console.log('Guardando resultados del juego:', gameData);
    const headers = this.getHeaders();
    
    return this.http.post<{success: boolean}>(
      `${this.apiUrl}/game/save`,
      gameData,
      { headers }
    ).pipe(
      tap(response => console.log('Respuesta guardado:', response)),
      catchError(error => {
        console.error('Error al guardar resultados:', error);
        return of({ success: false });
      })
    );
  }
}
