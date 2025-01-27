import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
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
    const headers = this.getHeaders();
    console.log('Headers for getUserStats:', headers); // Debug log

    return this.http.get<UserStats>(`${this.apiUrl}/user/stats`, { headers }).pipe(
      tap(response => console.log('Stats response:', response)),
      catchError((error) => {
        console.error('getUserStats error:', error);
        // Redirigir al login si el token es inválido
        if (error.status === 403) {
          this.registreService.logout();
          // Puedes inyectar Router y redirigir aquí si lo necesitas
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
    return this.http.put(
      `${this.apiUrl}/user/ship`, 
      { shipId },
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Update ship response:', response)),
      catchError(this.handleError<any>('updateUserShip', null))
    );
  }

  getUserAchievements(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/user/achievements`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError<any[]>('getUserAchievements', []))
    );
  }

  saveGameResults(gameData: GameData): Observable<{success: boolean}> {
    return this.http.post<{success: boolean}>(
      `${this.apiUrl}/game/save`,
      gameData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError<{success: boolean}>('saveGameResults', { success: false }))
    );
  }
}
