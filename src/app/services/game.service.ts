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
    return this.http.get<UserStats>(`${this.apiUrl}/user/stats`).pipe(
      tap(response => console.log('Stats response:', response)),
      catchError(this.handleError<UserStats>('getUserStats', {
        millor_puntuacio: 0,
        total_partides: 0,
        temps_total_jugat: 0
      }))
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
    return this.http.put(`${this.apiUrl}/user/ship`, { shipId }).pipe(
      tap(response => console.log('Update ship response:', response)),
      catchError(this.handleError<any>('updateUserShip', null))
    );
  }

  getUserAchievements(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/achievements`).pipe(
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
